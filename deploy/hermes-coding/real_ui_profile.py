"""Offline real-UI transfer/profile admission. No cloud import or execution.

The emitted packet is NOT live acceptance or financial authorization. Only
controller-owned bytes cross the boundary; no repository walk or file sync.
"""
import hashlib
import json
from pathlib import Path
import stat

from real_project_policy import candidate_preflight, PATH

VERIFIER_SHA256 = '54881bbb9bbd8f8dedc2ee537d3eddbebd1e7522989e26f46157a19584dc8a5c'
NODE_VERSION = '24.22.1'
NODE_ARCHIVE_SHA256 = '6c172a9ab6718f7b801fb5a7bd486af2ee5e32758086a04b84fcce2aa77095e6'
MAX_TRANSFER_BYTES = 49152
MAX_GUESTS = 2
MAX_GUEST_SECONDS = 90


def private_bytes(path, max_size):
    """For trusted operator snapshots only; never a model-selected path."""
    import os
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        meta = os.fstat(fd)
        if not stat.S_ISREG(meta.st_mode) or meta.st_uid != os.getuid() or meta.st_mode & 0o077 or not 0 < meta.st_size <= max_size:
            raise ValueError('REAL_UI_PRIVATE_FILE_DENIED')
        data = os.read(fd, max_size + 1)
        if len(data) != meta.st_size:
            raise ValueError('REAL_UI_PRIVATE_FILE_DENIED')
        return data
    finally:
        os.close(fd)


def transfer_packet(body, baseline, verifier):
    candidate = candidate_preflight(body, baseline)
    if not isinstance(verifier, str) or hashlib.sha256(verifier.encode()).hexdigest() != VERIFIER_SHA256:
        raise ValueError('REAL_UI_VERIFIER_DENIED')
    files = {'ui.ts': body['files'][PATH], 'sam-verifier.cjs': verifier}
    encoded = json.dumps(files, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    if len(encoded) > MAX_TRANSFER_BYTES:
        raise ValueError('REAL_UI_TRANSFER_SIZE_DENIED')
    return {'kind': 'REAL_UI_TRANSFER_ONLY', **candidate, 'files': files,
            'transferSha256': hashlib.sha256(encoded).hexdigest(),
            'verifierSha256': VERIFIER_SHA256, 'dependencies': [],
            'dispatchEnabled': False}


def sandbox_options(name):
    import re
    import uuid
    if not isinstance(name, str) or not re.fullmatch(r'sam-ui-[0-9a-f-]{36}-(candidate|independent)', name):
        raise ValueError('REAL_UI_GUEST_NAME_DENIED')
    try:
        job_id = name[7:43]
        if str(uuid.UUID(job_id)) != job_id:
            raise ValueError('id')
    except ValueError:
        raise ValueError('REAL_UI_GUEST_NAME_DENIED') from None
    return {'name': name, 'cpu': (0.5, 0.5), 'memory': (1024, 1024),
            'timeout': MAX_GUEST_SECONDS, 'block_network': True,
            'env': {}, 'secrets': [], 'volumes': {}, 'network_file_systems': {},
            'include_oidc_identity_token': False, 'workdir': '/workspace',
            'encrypted_ports': [], 'unencrypted_ports': [], 'h2_ports': []}


def image_admission(receipt, expected_recipe_sha256):
    """Require independently reviewed immutable image identity, not a tag.

    Trusted operator receipt only. Structural checks do not authenticate its
    origin; the future controller must read it through the private-file boundary
    and bind it to provider observations. Never admit a model-supplied receipt.
    This does not mint such a receipt or call Modal's image builder.
    """
    import re
    keys = {'kind', 'imageId', 'recipeSha256', 'nodeVersion', 'nodeArchiveSha256',
            'verifierSha256', 'networkIsolationPassed', 'secretIsolationPassed',
            'resourceLimitsPassed', 'controllerDeathPassed', 'cleanupConfirmed'}
    if not isinstance(receipt, dict) or set(receipt) != keys:
        raise ValueError('REAL_UI_LIVE_IMAGE_RECEIPT_DENIED')
    if receipt['kind'] != 'REAL_UI_LIVE_IMAGE_ACCEPTANCE' or not isinstance(receipt['imageId'], str) or not re.fullmatch(r'im-[A-Za-z0-9]+', receipt['imageId']):
        raise ValueError('REAL_UI_LIVE_IMAGE_RECEIPT_DENIED')
    if not isinstance(expected_recipe_sha256, str) or not re.fullmatch('[a-f0-9]{64}', expected_recipe_sha256):
        raise ValueError('REAL_UI_LIVE_IMAGE_RECEIPT_DENIED')
    if receipt['recipeSha256'] != expected_recipe_sha256 or receipt['nodeVersion'] != NODE_VERSION or receipt['nodeArchiveSha256'] != NODE_ARCHIVE_SHA256 or receipt['verifierSha256'] != VERIFIER_SHA256:
        raise ValueError('REAL_UI_LIVE_IMAGE_RECEIPT_DENIED')
    for name in ['networkIsolationPassed', 'secretIsolationPassed', 'resourceLimitsPassed', 'controllerDeathPassed', 'cleanupConfirmed']:
        if receipt[name] is not True:
            raise ValueError('REAL_UI_LIVE_IMAGE_RECEIPT_DENIED')
    return receipt['imageId']
