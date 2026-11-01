#!/usr/bin/env python3
"""Read only pinned hash/summary/execution metadata; no database or row access."""
import datetime
import hashlib
import json
import pathlib
import re
import stat
import sys

ROOT = pathlib.Path('/tmp/sam-pr86-restore-2013')
PRIVATE = pathlib.Path('/tmp/sam-fullrow-proof-frf3ufsz')
HELPER_SHA = '6b6bd83823503fe61d7bf038fb111e02eb9f6a48c6fb74103f1c64e9386d7b91'
PAIRS_SHA = 'b2a2d29db8fd7cecd4ba3f0e1c013bfeefbdf54c74467e65d170c744256c903a'
ARCHIVE_SHA = 'b40ce0f831238bc060f49affdf5e8dcaf31670d2624b00d6d0053a3e43790a79'

class Refused(Exception):
    pass

def need(value, code):
    if not value:
        raise Refused(code)

def read_pinned(path, limit):
    info = path.lstat()
    need(stat.S_ISREG(info.st_mode) and not path.is_symlink(), 'REGULAR_METADATA_FILE_REQUIRED')
    need(0 < info.st_size <= limit, 'METADATA_SIZE_REFUSED')
    data = path.read_bytes()
    need(len(data) == info.st_size, 'METADATA_READ_CHANGED')
    return data

def main():
    helper = read_pinned(ROOT / 'native_fullrow_proof.py', 32768)
    need(hashlib.sha256(helper).hexdigest() == HELPER_SHA, 'ACTUAL_HELPER_HASH_MISMATCH')
    execution = json.loads(read_pinned(ROOT / 'fullrow-execution.json', 8192))
    summary = json.loads(read_pinned(ROOT / 'fullrow-summary.json', 8192))
    saved = json.loads(read_pinned(PRIVATE / 'summary.json', 8192))
    need(execution.get('exit') == 0 and execution.get('helper_sha256') == HELPER_SHA,
         'EXECUTION_IDENTITY_OR_EXIT_MISMATCH')
    start = datetime.datetime.fromisoformat(execution['started_at'])
    end = datetime.datetime.fromisoformat(execution['finished_at'])
    need(start.tzinfo is not None and end.tzinfo is not None and start <= end,
         'EXECUTION_TIMESTAMPS_REFUSED')
    need(summary == saved, 'ACTUAL_AND_SAVED_SUMMARY_MISMATCH')
    need(summary.get('status') == 'EXACT_NATIVE_COPY_ROW_BYTES_VERIFIED_ROLLBACK_ONLY'
         and summary.get('target') == 'dpg-dbjpqkutlv9c73dup8lg-a'
         and summary.get('database') == 'sam_restore_pr86_20261101_2013'
         and summary.get('archive_sha256') == ARCHIVE_SHA,
         'SUMMARY_TARGET_OR_ARCHIVE_MISMATCH')
    pairs_raw = read_pinned(PRIVATE / 'table-copy-hashes.private.json', 65536)
    need(hashlib.sha256(pairs_raw).hexdigest() == PAIRS_SHA
         and summary.get('private_table_hashes_sha256') == PAIRS_SHA,
         'PINNED_HASH_FILE_MISMATCH')
    pairs = json.loads(pairs_raw)
    need(isinstance(pairs, list) and len(pairs) == 91, 'TABLE_COUNT_MISMATCH')
    keys = {'schema', 'table', 'archive_rows', 'native_rows',
            'archive_sorted_copy_sha256', 'native_sorted_copy_sha256', 'match'}
    unique = set()
    archive_rows = native_rows = 0
    for row in pairs:
        need(isinstance(row, dict) and set(row) == keys, 'PAIR_SHAPE_REFUSED')
        need(all(isinstance(row[k], str) and re.fullmatch('[a-z_][a-z0-9_]*', row[k])
                 for k in ('schema', 'table')), 'TABLE_IDENTITY_REFUSED')
        identity = (row['schema'], row['table'])
        need(identity not in unique, 'DUPLICATE_TABLE_IDENTITY')
        unique.add(identity)
        need(all(type(row[k]) is int and row[k] >= 0
                 for k in ('archive_rows', 'native_rows')), 'ROW_COUNT_REFUSED')
        need(row['archive_rows'] == row['native_rows'] and row['match'] is True,
             'PAIR_ROW_COUNT_MISMATCH')
        left, right = row['archive_sorted_copy_sha256'], row['native_sorted_copy_sha256']
        need(isinstance(left, str) and isinstance(right, str)
             and re.fullmatch('[0-9a-f]{64}', left) and left == right, 'PAIR_HASH_MISMATCH')
        archive_rows += row['archive_rows']
        native_rows += row['native_rows']
    need(archive_rows == native_rows == summary.get('rows') == 11034
         and summary.get('tables') == len(unique) == 91, 'AGGREGATE_MISMATCH')
    for key in ('all_sorted_native_copy_bytes_match_archive', 'duplicate_rows_preserved',
                'explicit_rollback_sent', 'dedicated_transaction_connection_closed',
                'fresh_postrollback_rls_policy_owner_acl_snapshot_equal'):
        need(summary.get(key) is True, 'SUMMARY_ASSERTION_MISSING')
    for key in ('row_mutations_performed', 'production_connected',
                'application_role_rls_acceptance_proven', 'application_or_provider_started',
                'source_permission_fidelity_proven'):
        need(summary.get(key) is False, 'SCOPE_LIMIT_MISMATCH')
    print(json.dumps({
        'status': 'PINNED_HASH_PAIRS_AND_EXECUTION_METADATA_VERIFIED',
        'checker_source_sha256': hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),
        'actual_helper_sha256': HELPER_SHA, 'hash_pairs_file_sha256': PAIRS_SHA,
        'archive_sha256': ARCHIVE_SHA, 'unique_tables': len(unique),
        'archive_rows': archive_rows, 'native_rows': native_rows,
        'all_91_count_and_hash_pairs_match': True,
        'execution_exit': execution['exit'], 'execution_started_at': execution['started_at'],
        'execution_finished_at': execution['finished_at'],
        'actual_and_saved_summary_equal': True,
        'fresh_postrollback_security_equality_recorded': True,
        'database_calls_by_checker': 0, 'customer_rows_read_by_checker': False,
        'per_table_identifiers_or_hashes_printed': False,
        'scope': 'Independent offline algorithm over pinned actual metadata; execution witnessed by root. Not application-role RLS or production release acceptance.'
    }))

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'status': 'REFUSED',
                          'code': str(error) if isinstance(error, Refused) else 'METADATA_READ_OR_PARSE_FAILED',
                          'exception_type': type(error).__name__}), file=sys.stderr)
        sys.exit(1)
