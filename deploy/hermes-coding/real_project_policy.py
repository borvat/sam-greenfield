"""OFFLINE/UNREGISTERED preflight only: never dispatches, executes or publishes.

This narrowly describes the reviewed UI task. Passing it is not live admission,
credential scoping, independent verification, cost approval or publication.
"""
import hashlib
import re
import uuid

REPOSITORY='borvat/sam-greenfield'
BASE='91da88a224eabb2e0a9701dd1ed462c7a0e69f2d'
PATH='apps/command-center/src/ui.ts'
BASE_SOURCE_SHA256='0bb06f3c6e976a9f5d3878df97268260c47d365757afd7d44ba877f94e0c2c35'
ANCHOR="  document.getElementById('goalProgress').textContent='Loading goal evidence…';\n"
ASSIGNMENT=re.compile(r"  document\.getElementById\('(finalReport|timeline)'\)\.textContent='([A-Za-z0-9 .…:_-]{1,120})';\n")

def candidate_preflight(body,baseline):
    if not isinstance(body,dict) or set(body)!={'jobId','repository','base','files'}:
        raise ValueError('PROJECT_SCHEMA_DENIED')
    if body['repository']!=REPOSITORY or body['base']!=BASE:
        raise ValueError('PROJECT_TARGET_DENIED')
    try:
        if not isinstance(body['jobId'],str) or str(uuid.UUID(body['jobId']))!=body['jobId']:
            raise ValueError('id')
    except (ValueError,TypeError,AttributeError):raise ValueError('PROJECT_ID_DENIED') from None
    files=body['files']
    if not isinstance(files,dict) or set(files)!={PATH}:
        raise ValueError('PROJECT_FILES_DENIED')
    source=files[PATH]
    if not isinstance(source,str) or not isinstance(baseline,str):
        raise ValueError('PROJECT_ENCODING_DENIED')
    try:
        source_bytes=source.encode('utf8');base_bytes=baseline.encode('utf8')
    except UnicodeEncodeError:raise ValueError('PROJECT_ENCODING_DENIED') from None
    if len(source_bytes)>32768:
        raise ValueError('PROJECT_SIZE_DENIED')
    if hashlib.sha256(base_bytes).hexdigest()!=BASE_SOURCE_SHA256 or baseline.count(ANCHOR)!=1:
        raise ValueError('PROJECT_BASE_DENIED')
    prefix,suffix=baseline.split(ANCHOR)
    prefix+=ANCHOR
    if not source.startswith(prefix) or not source.endswith(suffix):
        raise ValueError('PROJECT_PATCH_DENIED')
    inserted=source[len(prefix):len(source)-len(suffix)]
    matches=list(ASSIGNMENT.finditer(inserted))
    if len(matches)!=2 or ''.join(m.group(0) for m in matches)!=inserted or {m.group(1) for m in matches}!={'finalReport','timeline'}:
        raise ValueError('PROJECT_PATCH_DENIED')
    return {'jobId':body['jobId'],'repository':REPOSITORY,'base':BASE,'path':PATH,
        'sourceHash':hashlib.sha256(source_bytes).hexdigest(),'bytes':len(source_bytes),
        'mode':'OFFLINE_PREFLIGHT_ONLY'}

def publisher_destination_preflight(request,job_id):
    if not isinstance(request,dict) or set(request)!={'repository','base','branch','draft','operation'}:
        raise ValueError('PUBLISH_SCHEMA_DENIED')
    if request['repository']!=REPOSITORY or request['base']!=BASE:
        raise ValueError('PUBLISH_TARGET_DENIED')
    try:
        if str(uuid.UUID(job_id))!=job_id:raise ValueError('id')
    except (ValueError,TypeError,AttributeError):raise ValueError('PUBLISH_ID_DENIED') from None
    if request['branch']!='hermes/real-ui-'+job_id or request['draft'] is not True or request['operation']!='create_draft_pr':
        raise ValueError('PUBLISH_OPERATION_DENIED')
    # Deliberately no network/SDK/token/file write. Actual publisher additionally
    # needs a one-repo credential and authenticated independent-verifier receipt.
    return {'mode':'OFFLINE_PREFLIGHT_ONLY','credentialScopeVerified':False,'published':False}
