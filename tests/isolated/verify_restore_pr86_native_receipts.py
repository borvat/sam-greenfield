#!/usr/bin/env python3
"""Offline receipt/source hashes only. No config, credentials, row files or DB calls."""
import datetime
import hashlib
import json
import pathlib
import stat
import sys

ROOT = pathlib.Path('/tmp/sam-pr86-restore-2013')
HARNESS = ROOT / 'native-harness'
R2 = ROOT / 'native-run-2/drill'
R3 = ROOT / 'native-run-3/drill'
PRIOR_SHA = '6cde74dda5eac90930d01d59b352ecac863fb11502729dab0a736af684249efc'
STATE_SHA = '8ed31f87940fd194b75698df04c429a3444cdff9575c0c5dca2c723854468fe0'
NEW_SHA = '36b83d45e06845f787d4feec7519ba55005fb301ec9e4be4ff74a173cbfdd490'
PINS_SHA = 'bceda6da20e8f33341b5a5efa38404e7e7ee0bacfd94722cc5142c9965179163'
MANIFEST_SHA = 'c928d82f6c79f7073bf87d10d3321f5db75ea74b2284d28ab31577dc202ddd3e'
PINS = {
    'forward': ('8a08e6163516f30f37c65313134170744330c4f4', '974bf2fa7eab05303fa47fbd354dc535838e25af'),
    'runtime_fallback': ('2d4d32e286ff71307417f7375985b85214c7a2e6', '9cb7c3708b816c62c25fceb626d688e0317cb095'),
    'cc_mcp_fallback': ('0f056d36f98413b7590a405294693c0b5fc18885', '9c6e9b9dabbb68ae83db0fd054b6a6c143f3edfa'),
}

class Refused(Exception):
    pass

def need(value, code):
    if not value:
        raise Refused(code)

def raw(path, expected=None, limit=4*1024*1024):
    info = path.lstat()
    need(stat.S_ISREG(info.st_mode) and not path.is_symlink() and 0 < info.st_size <= limit,
         'REGULAR_BOUNDED_METADATA_REQUIRED')
    value = path.read_bytes()
    need(expected is None or hashlib.sha256(value).hexdigest() == expected, 'PINNED_FILE_HASH_MISMATCH')
    return value

def obj(path, expected=None):
    return json.loads(raw(path, expected))

def main():
    pins = obj(HARNESS / 'source-pins.json', PINS_SHA)
    manifest = obj(HARNESS / 'prep-manifest.json', MANIFEST_SHA)
    for filename in ('common.cjs', 'native-child.mjs', 'run-native.cjs'):
        raw(HARNESS / filename, manifest['files'][filename])
    source_counts = {}
    for variant, (commit, tree) in PINS.items():
        pin = pins['sources'][variant]
        need((pin['commit'], pin['tree']) == (commit, tree), 'APPLICATION_PIN_MISMATCH')
        for item in pin['files']:
            part = pathlib.PurePosixPath(item['path'])
            need(not part.is_absolute() and '..' not in part.parts, 'SOURCE_PATH_REFUSED')
            raw(HARNESS / 'sources' / variant / item['path'], item['sha256'])
        source_counts[variant] = len(pin['files'])
    prior, current = obj(R2 / 'native-drill-receipt.json', PRIOR_SHA), obj(R3 / 'native-drill-receipt.json', NEW_SHA)
    state = obj(R2 / 'synthetic-fixture-state.json', STATE_SHA)
    need(raw(R3 / 'synthetic-fixture-state.json', STATE_SHA) == raw(R2 / 'synthetic-fixture-state.json', STATE_SHA),
         'INHERITED_FIXTURE_STATE_CHANGED')
    compact = obj(ROOT / 'native-third-attempt-redacted.json')
    execution = obj(ROOT / 'native-bootstrap-execution.json')
    bootstrap = obj(ROOT / 'native-run-3/app-login-bootstrap-receipt.json')
    need(execution == compact['execution'] and execution['exit'] == 0, 'EXECUTION_BINDING_MISMATCH')
    need(datetime.datetime.fromisoformat(execution['started_at']) <= datetime.datetime.fromisoformat(execution['finished_at']),
         'EXECUTION_TIME_MISMATCH')
    need(prior['status'] == 'BLOCKED_OR_FAILED' and current['status'] == compact['status'] ==
         'ROLE_SCOPED_NATIVE_SOURCE_AND_STARTUP_REHEARSAL_PASS', 'REHEARSAL_STATUS_MISMATCH')
    for record in (prior, current):
        need(record['targetRenderId'] == 'dpg-dbjpqkutlv9c73dup8lg-a' and
             record['databaseName'] == 'sam_restore_pr86_20261101_2013' and
             record['classification'] == 'NATIVE_SYNTHETIC_REHEARSAL_NOT_LIVE_BUSINESS_ACCEPTANCE' and
             record['processCleanup']['allRegisteredChildrenClosed'] is True, 'TARGET_OR_CLEANUP_MISMATCH')
    inherited = current['inheritedProof']
    need(inherited == compact['inherited'] and inherited['receiptSha256'] == PRIOR_SHA and
         inherited['fixtureStateSha256'] == STATE_SHA and inherited['runId'] == state['runId'] and
         inherited['successfulNativePhases'] == 10, 'INHERITED_BINDING_MISMATCH')
    artifact_keys = ('nodeVersion', 'nodeBinarySha256', 'nodeArchiveSha256', 'dependencyArchiveSha256',
                     'dependencyTreeManifestSha256', 'installProvenanceSha256')
    need(all(prior['runtimeArtifacts'][key] == current['runtimeArtifacts'][key] for key in artifact_keys),
         'RUNTIME_ARTIFACT_BINDING_MISMATCH')
    old_expected = [('forward','seed'),('forward','save'),('forward','revision2'),
                    ('runtime_fallback','save'),('runtime_fallback','negative'),('runtime_fallback','fingerprint'),
                    ('cc_mcp_fallback','save'),('cc_mcp_fallback','negative'),('cc_mcp_fallback','fingerprint'),
                    ('cc_mcp_fallback','fingerprint')]
    new_expected = [('cc_mcp_fallback','fingerprint')]*4 + [('runtime_fallback','runtime-gate')]*2 + \
                   [('runtime_fallback','fingerprint')]*2 + [('runtime_fallback','runtime-gate')] + \
                   [('runtime_fallback','fingerprint')]*2
    negatives = ['CHANGED_ACCEPTED_PAYLOAD_CONFLICT','FOREIGN_SOURCE_BINDING_DENIED','ROLE_GUC_SPOOF_READ_WRITE_DENIED']
    for record, expected in ((prior, old_expected), (current, new_expected)):
        rows = record['receipts']
        need([(row['variant'], row['mode']) for row in rows] == expected, 'PHASE_SEQUENCE_MISMATCH')
        for row in rows:
            need((row['sourceCommit'],row['sourceTree']) == PINS[row['variant']] and
                 row.get('status') != 'FAILED' and row['role'] == 'sam_runtime_app' and
                 row['database'] == 'sam_restore_pr86_20261101_2013' and
                 row['roleVisibleOriginalFingerprintsUnchanged'] is True, 'PHASE_SOURCE_OR_FINGERPRINT_MISMATCH')
            if row['mode'] == 'save':
                need((row['id'],row['report_hash'],row['revision']) ==
                     (state['reportId'],state['reportHash'],1), 'SAVED_REPORT_IDENTITY_MISMATCH')
            if row['mode'] == 'revision2':
                need(row['revision2Id'] == state['revision2Id'], 'REVISION2_IDENTITY_MISMATCH')
            if row['mode'] == 'negative':
                need(row['negativeChecks'] == negatives, 'NEGATIVE_CHECK_SET_MISMATCH')
            if row['mode'] == 'runtime-gate':
                need(row['runtimeAllowed'] is True and all(type(n) is int and n == 0 for n in row['runtimeGate'].values()),
                     'NONEMPTY_RUNTIME_GATE')
            if row['mode'] != 'seed':
                need(row.get('fixtureRevisionsUnchanged') is True or row['mode'] in ('save','revision2'),
                     'FIXTURE_REVISION_MUTATION')
    starts = [row for row in current['appProof'] if row.get('actualMainFile') is True]
    stops = [row for row in current['appProof'] if 'gracefulStop' in row]
    expected_services = {('cc_mcp_fallback',1,'mcp'),('cc_mcp_fallback',2,'command-center'),
                         ('cc_mcp_fallback',2,'mcp'),('runtime_fallback',1,'runtime'),('runtime_fallback',2,'runtime')}
    identity = lambda row: (row['variant'],row['round'],row['service'])
    need(len(starts) == len(stops) == 5 and set(map(identity,starts)) == set(map(identity,stops)) == expected_services,
         'SERVICE_COUNT_OR_IDENTITY_MISMATCH')
    for row in starts:
        need((row['commit'],row['tree']) == PINS[row['variant']] and row['loopbackOnly'] is True and
             row['serialServiceProcess'] is True and row['providerEnvironment'] == 'EMPTY_ALLOWLIST' and
             row['revision2Preserved'] is True and row['authAndSavedRead'] ==
             ('ZERO_TICKS_ERRORS_AND_INFLIGHT' if row['service'] == 'runtime' else 'PASS_SAVED_ORIGINAL_ID_HASH'),
             'ACTUAL_SERVICE_SOURCE_OR_READ_MISMATCH')
    need(all(row['gracefulStop'] is True for row in stops), 'SERVICE_STOP_MISMATCH')
    need(any(row.get('service') == 'command-center' and row.get('round') == 1 and
             row.get('authAndSavedRead') == 'PASS_SAVED_ORIGINAL_ID_HASH' for row in prior['appProof']) and
         any(row.get('service') == 'command-center' and row.get('round') == 1 and
             row.get('gracefulStop') is True for row in prior['appProof']), 'PRIOR_CC_PROOF_MISSING')
    need(bootstrap['restoredStubNoLogin'] is True and bootstrap['remainingAppSessions'] == 0 and
         bootstrap['processCleanup']['allRegisteredChildrenClosed'] is True and
         bootstrap['credentialsPersistedOrPrinted'] is False and bootstrap['aclOrMembershipChanged'] is False,
         'BOOTSTRAP_CLEANUP_MISMATCH')
    print(json.dumps({'status':'PINNED_NATIVE_PHASE_AND_SERVICE_RECEIPTS_VERIFIED_OFFLINE',
        'checker_source_sha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),
        'new_receipt_sha256':NEW_SHA,'prior_receipt_sha256':PRIOR_SHA,'fixture_state_sha256':STATE_SHA,
        'source_pins_sha256':PINS_SHA,'harness_manifest_sha256':MANIFEST_SHA,
        'materialized_source_file_counts':source_counts,'prior_successful_phases':10,'new_successful_phases':11,
        'new_service_starts':5,'new_graceful_stops':5,'runtime_gate_checks':3,
        'source_and_saved_report_bindings_match':True,'role_visible_fingerprints_unchanged':True,
        'role_nologin_restored':True,'remaining_app_sessions':0,'children_closed':True,
        'database_calls_by_checker':0,'customer_rows_read_by_checker':False,
        'scope':'Pinned root-observed native synthetic process/report rehearsal; not a business goal, production deploy rollback, hidden-row equality or complete application acceptance.'}))

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'status':'REFUSED','code':str(error) if isinstance(error,Refused) else 'METADATA_READ_OR_SHAPE_FAILED',
                          'exception_type':type(error).__name__}),file=sys.stderr)
        sys.exit(1)
