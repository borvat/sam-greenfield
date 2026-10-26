"""Narrow authenticated artifact verifier; no model-facing host execution tool."""
import asyncio
import hashlib
import hmac
import json
import os
from pathlib import Path
import sqlite3
import time
import uuid
from aiohttp import web

DB='/opt/data/sam-modal-coding-jobs.sqlite'


def execute(body):
    policy=json.loads(Path('/opt/data/sam-modal-coding-policy.json').read_text())
    if policy.get('enabled') is not True or policy.get('maxJobs')!=1 or time.time()>=policy['expiresAtEpoch']:
        return {'ok':False,'error':'CODING_POLICY_CLOSED'}
    if set(body)!={'jobId','artifact'} or str(uuid.UUID(body['jobId']))!=body['jobId']:
        return {'ok':False,'error':'CODING_SCOPE_DENIED'}
    digest=hashlib.sha256(json.dumps(body,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    fd=os.open(DB,os.O_WRONLY|os.O_CREAT,0o600);os.close(fd);os.chmod(DB,0o600)
    db=sqlite3.connect(DB,timeout=3);db.execute('PRAGMA journal_mode=WAL');db.execute('CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,digest TEXT,state TEXT,result TEXT)')
    db.execute('BEGIN IMMEDIATE');prior=db.execute('SELECT digest,state,result FROM jobs WHERE id=?',(body['jobId'],)).fetchone()
    if prior:
        db.rollback();db.close()
        if prior[0]!=digest:return {'ok':False,'error':'CODING_ID_CONFLICT'}
        return json.loads(prior[2]) if prior[2] else {'ok':False,'error':'CODING_IN_PROGRESS_RECONCILE'}
    if db.execute('SELECT count(*) FROM jobs').fetchone()[0]>=1:
        db.rollback();db.close();return {'ok':False,'error':'CODING_TASK_CEILING'}
    db.execute('INSERT INTO jobs VALUES(?,?,?,NULL)',(body['jobId'],digest,'CLAIMED'));db.commit();db.close()
    import subprocess
    env={'PATH':'/usr/bin:/bin','MODAL_CONFIG_PATH':'/opt/data/sam-modal-acceptance.toml'}
    output='/opt/data/sam-modal-coding-'+body['jobId']+'.json'
    try:
        p=subprocess.run(['/tmp/sam-modal-sdk/bin/python','/opt/data/sam-modal-coding-worker.py',output],input=json.dumps(body),env=env,text=True,capture_output=True,timeout=150)
        result=json.loads(p.stdout)
    except Exception:result={'ok':False,'error':'CODING_EXECUTION_UNCERTAIN_RECONCILE'}
    db=sqlite3.connect(DB);db.execute('UPDATE jobs SET state=?,result=? WHERE id=?',('DONE',json.dumps(result),body['jobId']));db.commit();db.close()
    return result


async def handle(request):
    if request.path!='/sam/coding/verify':return web.json_response({'error':'scope'},status=404)
    key=os.environ.get('API_SERVER_KEY','');supplied=request.headers.get('Authorization','')
    if len(key)<32 or not hmac.compare_digest(supplied,'Bearer '+key):return web.json_response({'error':'unauthorized'},status=401)
    if request.content_length is None or request.content_length>16384:return web.json_response({'error':'size'},status=413)
    try:
        raw=await request.content.readexactly(request.content_length)
        body=json.loads(raw)
        return web.json_response(await asyncio.to_thread(execute,body))
    except Exception:return web.json_response({'ok':False,'error':'CODING_REQUEST_DENIED'},status=400)
