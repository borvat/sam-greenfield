"""Narrow authenticated artifact verifier; no model-facing host execution tool."""
import asyncio
import hashlib
import hmac
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import time
import uuid
from aiohttp import web

DB='/opt/data/sam-modal-coding-jobs.sqlite'

# Trusted operator-owned sibling, never a payload path. Loading it performs no
# Modal import, cloud call, candidate import or generated-code execution.
_worker_path=os.path.join(os.path.dirname(__file__),'modal_worker.py')
if not os.path.isfile(_worker_path):
    _worker_path=os.path.join(os.path.dirname(__file__),'sam-modal-coding-worker.py')
_spec=importlib.util.spec_from_file_location('sam_coding_policy',_worker_path)
_worker=importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_worker)


def checked_result(result,body,legacy=False):
    """Defense in depth: stdout is evidence to validate, never authority."""
    invalid={'ok':False,'error':'CODING_RECEIPT_DENIED_RECONCILE'}
    if not isinstance(result,dict):return invalid
    if result.get('ok') is False:
        error=result.get('error')
        if isinstance(error,str) and len(error)<=128 and error and all(c.isupper() or c.isdigit() or c=='_' for c in error):
            return {'ok':False,'error':error}
        return invalid
    if result.get('ok') is not True:return invalid
    r=result.get('receipt')
    if not isinstance(r,dict):return invalid
    digest=lambda text:hashlib.sha256(text.encode()).hexdigest()
    artifact=body['artifact'];source=artifact['files']['clamp.py']
    independent=digest(_worker.INDEPENDENT)
    if r.get('complete') is not True or r.get('jobId')!=body['jobId'] or r.get('sourceHash')!=digest(source) or type(r.get('independentAssertions')) is not int or r['independentAssertions']!=46 or r.get('wrongCodeRejected') is not True:
        return invalid
    for key,expected in [('requestedTestsHash',digest(artifact['tests'])),('independentTestsHash',independent)]:
        if (not legacy or key in r) and r.get(key)!=expected:return invalid
    stages=r.get('stages')
    if not isinstance(stages,list) or len(stages)!=3:return invalid
    ids=set()
    for index,(stage,name) in enumerate(zip(stages,['wrong_control','hermes_requested_tests','sam_independent_tests'])):
        if not isinstance(stage,dict) or stage.get('name')!=name or stage.get('cleanup') is not True:return invalid
        sid=stage.get('sandboxId')
        if not isinstance(sid,str) or not 1<=len(sid)<=128 or sid in ids:return invalid
        ids.add(sid)
        expected_source=digest(_worker.BROKEN if index==0 else source)
        expected_tests=digest(artifact['tests']) if index==1 else independent
        for key,expected in [('sourceHash',expected_source),('testsHash',expected_tests)]:
            if (not legacy or key in stage) and stage.get(key)!=expected:return invalid
        for key in ['stdoutHash','stderrHash']:
            value=stage.get(key)
            if not isinstance(value,str) or len(value)!=64 or any(c not in '0123456789abcdef' for c in value):return invalid
        code=stage.get('exitCode')
        if type(code) is not int:return invalid
        if index==0:
            if code!=1 or stage.get('rejected') is not True:return invalid
        elif code!=0:return invalid
    observed=stages[2].get('result')
    if not isinstance(observed,dict) or set(observed)!={'passed','assertions'} or observed['passed'] is not True or type(observed['assertions']) is not int or observed['assertions']!=46:return invalid
    return {'ok':True,'receipt':r}


def execute(body):
    try:
        if not isinstance(body,dict) or set(body)!={'jobId','artifact'} or not isinstance(body['jobId'],str) or str(uuid.UUID(body['jobId']))!=body['jobId']:
            raise ValueError('scope')
        _worker.validate_payload(body)
    except (TypeError,ValueError,KeyError,AttributeError,RecursionError,SyntaxError):
        return {'ok':False,'error':'CODING_SCOPE_DENIED'}
    digest=hashlib.sha256(json.dumps(body,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    fd=os.open(DB,os.O_WRONLY|os.O_CREAT,0o600);os.close(fd);os.chmod(DB,0o600)
    db=sqlite3.connect(DB,timeout=3);db.execute('PRAGMA journal_mode=WAL');db.execute('CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,digest TEXT,state TEXT,result TEXT)')
    db.execute('BEGIN IMMEDIATE');prior=db.execute('SELECT digest,state,result FROM jobs WHERE id=?',(body['jobId'],)).fetchone()
    if prior:
        db.rollback();db.close()
        if prior[0]!=digest:return {'ok':False,'error':'CODING_ID_CONFLICT'}
        # Legacy receipts are read-only history, never evidence for a new job.
        return checked_result(json.loads(prior[2]),body,legacy=True) if prior[2] else {'ok':False,'error':'CODING_IN_PROGRESS_RECONCILE'}
    # Replay above is readback only; a closed campaign never authorizes new work.
    policy=json.loads(Path('/opt/data/sam-modal-coding-policy.json').read_text())
    if policy.get('enabled') is not True or type(policy.get('maxJobs')) is not int or policy['maxJobs']!=1 or not isinstance(policy.get('expiresAtEpoch'),(int,float)) or not time.time()<policy['expiresAtEpoch']:
        db.rollback();db.close();return {'ok':False,'error':'CODING_POLICY_CLOSED'}
    if db.execute('SELECT count(*) FROM jobs').fetchone()[0]>=1:
        db.rollback();db.close();return {'ok':False,'error':'CODING_TASK_CEILING'}
    db.execute('INSERT INTO jobs VALUES(?,?,?,NULL)',(body['jobId'],digest,'CLAIMED'));db.commit();db.close()
    import subprocess
    env={'PATH':'/usr/bin:/bin','MODAL_CONFIG_PATH':'/opt/data/sam-modal-acceptance.toml'}
    output='/opt/data/sam-modal-coding-'+body['jobId']+'.json'
    try:
        p=subprocess.run(['/tmp/sam-modal-sdk/bin/python','/opt/data/sam-modal-coding-worker.py',output],input=json.dumps(body),env=env,text=True,capture_output=True,timeout=150)
        if getattr(p,'returncode',None)!=0:
            result={'ok':False,'error':'CODING_WORKER_FAILED_RECONCILE'}
        elif not isinstance(p.stdout,str) or len(p.stdout.encode())>32768:
            result={'ok':False,'error':'CODING_RECEIPT_DENIED_RECONCILE'}
        else:result=checked_result(json.loads(p.stdout),body)
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


if __name__=='__main__':
    app=web.Application(client_max_size=16384)
    app.router.add_post('/sam/coding/verify',handle)
    web.run_app(app,host='127.0.0.1',port=8877,access_log=None,print=None)

