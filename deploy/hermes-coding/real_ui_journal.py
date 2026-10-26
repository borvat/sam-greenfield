"""Operator-owned crash journal, separate from the accepted clamp campaign.

No SDK/model/network imports. Durable intent precedes every external create.
Uncertain work is never automatically retried. Reconciliation must observe and
terminate the exact owned guest by its deterministic name and confirm its exit.
"""
import json
import os
import re
import sqlite3
import stat
import uuid


class Journal:
    def __init__(self, path):
        parent = os.path.dirname(os.path.abspath(path))
        meta = os.lstat(parent)
        if not stat.S_ISDIR(meta.st_mode) or meta.st_uid != os.getuid() or meta.st_mode & 0o077:
            raise ValueError('REAL_UI_JOURNAL_DIRECTORY_DENIED')
        fd = os.open(path, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        try:
            meta = os.fstat(fd)
            if not stat.S_ISREG(meta.st_mode) or meta.st_uid != os.getuid() or meta.st_mode & 0o077:
                raise ValueError('REAL_UI_JOURNAL_FILE_DENIED')
        finally:
            os.close(fd)
        self.db = sqlite3.connect(path, timeout=3)
        self.db.execute('PRAGMA journal_mode=DELETE')
        self.db.execute('PRAGMA synchronous=FULL')
        self.db.executescript('''CREATE TABLE IF NOT EXISTS jobs(
          id TEXT PRIMARY KEY,digest TEXT NOT NULL,state TEXT NOT NULL,result TEXT);
          CREATE TABLE IF NOT EXISTS guests(
          job_id TEXT NOT NULL,stage TEXT NOT NULL,name TEXT NOT NULL UNIQUE,
          sandbox_id TEXT,state TEXT NOT NULL,exit_code INTEGER,
          PRIMARY KEY(job_id,stage),FOREIGN KEY(job_id) REFERENCES jobs(id));
          CREATE UNIQUE INDEX IF NOT EXISTS unique_real_ui_sandbox
          ON guests(sandbox_id) WHERE sandbox_id IS NOT NULL;''')
        self.db.execute('PRAGMA foreign_keys=ON')

    def close(self):
        self.db.close()

    def claim(self, job_id, digest):
        if not isinstance(job_id, str) or str(uuid.UUID(job_id)) != job_id or not isinstance(digest, str) or not re.fullmatch('[a-f0-9]{64}', digest):
            raise ValueError('REAL_UI_JOB_DENIED')
        self.db.execute('BEGIN IMMEDIATE')
        try:
            row = self.db.execute('SELECT digest,state,result FROM jobs WHERE id=?', (job_id,)).fetchone()
            if row:
                if row[0] != digest:
                    raise ValueError('REAL_UI_JOB_CONFLICT')
                if row[1] != 'ACCEPTED':
                    raise ValueError('REAL_UI_JOB_RECONCILE_REQUIRED')
                return json.loads(row[2])
            # One fresh real task for this separately provisioned journal.
            if self.db.execute('SELECT count(*) FROM jobs').fetchone()[0] != 0:
                raise ValueError('REAL_UI_TASK_CEILING')
            self.db.execute('INSERT INTO jobs VALUES(?,?,?,NULL)', (job_id, digest, 'CLAIMED'))
            self.db.commit()
            return None
        finally:
            if self.db.in_transaction:
                self.db.rollback()

    def intend(self, job_id, stage):
        if stage not in ['candidate', 'independent']:
            raise ValueError('REAL_UI_STAGE_DENIED')
        self.db.execute('BEGIN IMMEDIATE')
        try:
            row = self.db.execute('SELECT state FROM jobs WHERE id=?', (job_id,)).fetchone()
            if row != ('CLAIMED',):
                raise ValueError('REAL_UI_JOB_NOT_CLAIMED')
            if stage == 'independent' and self.db.execute("SELECT state FROM guests WHERE job_id=? AND stage='candidate'", (job_id,)).fetchone() != ('CLEANED',):
                raise ValueError('REAL_UI_STAGE_ORDER_DENIED')
            name = 'sam-ui-' + job_id + '-' + stage
            self.db.execute('INSERT INTO guests VALUES(?,?,?,NULL,?,NULL)', (job_id, stage, name, 'INTENT'))
            self.db.commit()
            return name
        except sqlite3.IntegrityError:
            raise ValueError('REAL_UI_GUEST_RECONCILE_REQUIRED') from None
        finally:
            if self.db.in_transaction:
                self.db.rollback()

    def attached(self, name, sandbox_id):
        if not isinstance(sandbox_id, str) or not re.fullmatch('sb-[A-Za-z0-9]+', sandbox_id):
            raise ValueError('REAL_UI_GUEST_ID_DENIED')
        try:
            with self.db:
                changed = self.db.execute("UPDATE guests SET sandbox_id=?,state='ATTACHED' WHERE name=? AND state='INTENT'", (sandbox_id, name)).rowcount
                if changed != 1:
                    raise ValueError('REAL_UI_GUEST_RECONCILE_REQUIRED')
        except sqlite3.IntegrityError:
            raise ValueError('REAL_UI_GUEST_REUSE_DENIED') from None

    def cleaned(self, name, sandbox_id, exit_code):
        # Called only after authenticated provider lookup, terminate(wait=True),
        # and a terminal poll. A missing/unavailable lookup is never success.
        if type(exit_code) is not int:
            raise ValueError('REAL_UI_EXIT_UNCONFIRMED')
        with self.db:
            changed = self.db.execute("UPDATE guests SET state='CLEANED',exit_code=? WHERE name=? AND sandbox_id=? AND state='ATTACHED'", (exit_code, name, sandbox_id)).rowcount
            if changed != 1:
                raise ValueError('REAL_UI_GUEST_RECONCILE_REQUIRED')

    def pending(self):
        return self.db.execute("SELECT job_id,stage,name,sandbox_id,state FROM guests WHERE state<>'CLEANED' ORDER BY job_id,stage").fetchall()

    def accept(self, job_id, receipt):
        # Receipt content/authentication is validated by the independent trusted
        # controller first. This journal additionally binds cleanup and job id.
        if not isinstance(receipt, dict) or receipt.get('jobId') != job_id or receipt.get('complete') is not True:
            raise ValueError('REAL_UI_RECEIPT_DENIED')
        self.db.execute('BEGIN IMMEDIATE')
        try:
            rows = self.db.execute('SELECT stage,state FROM guests WHERE job_id=? ORDER BY stage', (job_id,)).fetchall()
            if rows != [('candidate', 'CLEANED'), ('independent', 'CLEANED')]:
                raise ValueError('REAL_UI_CLEANUP_REQUIRED')
            changed = self.db.execute("UPDATE jobs SET state='ACCEPTED',result=? WHERE id=? AND state='CLAIMED'", (json.dumps(receipt, sort_keys=True), job_id)).rowcount
            if changed != 1:
                raise ValueError('REAL_UI_ACCEPTANCE_CONFLICT')
            self.db.commit()
        finally:
            if self.db.in_transaction:
                self.db.rollback()
