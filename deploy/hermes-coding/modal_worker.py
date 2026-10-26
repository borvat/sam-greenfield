"""Official Modal SDK controller. Candidate code executes ONLY in the external guest.
No model/Render/PostgreSQL/GitHub credentials are ever given to a guest.
"""
import ast
import hashlib
import json
import os
from pathlib import Path
import sys
import time
import warnings

BROKEN = 'def clamp(value, lower, upper):\n    if lower > upper:\n        raise ValueError("invalid bounds")\n    return min(lower, max(upper, value))\n'
INDEPENDENT = '''import json,sys,random
sys.path.insert(0,'/workspace')
from clamp import clamp
n=0
for lo,hi in [(-10,10),(0,0),(5,5),(-50,-20),(2,30)]:
 for v in [lo-1,lo,lo+1,hi-1,hi,hi+1,0,-100,100]:
  expected=lo if v<lo else hi if v>hi else v
  assert clamp(v,lo,hi)==expected
  n+=1
try:clamp(0,2,1)
except ValueError:pass
else:raise AssertionError('reversed bounds accepted')
print(json.dumps({'passed':True,'assertions':n+1}))
'''


def validate_source(source):
    if not isinstance(source, str) or not 1 <= len(source) <= 4000:
        raise ValueError('SOURCE_SIZE')
    tree = ast.parse(source)
    if len(tree.body) != 1 or not isinstance(tree.body[0], ast.FunctionDef):
        raise ValueError('FUNCTION_ONLY')
    fn = tree.body[0]
    if fn.name != 'clamp' or fn.decorator_list or fn.args.defaults or fn.args.kw_defaults or fn.args.kwonlyargs or fn.args.posonlyargs or fn.args.vararg or fn.args.kwarg or [a.arg for a in fn.args.args] != ['value', 'lower', 'upper']:
        raise ValueError('FUNCTION_SIGNATURE')
    allowed = (ast.Module, ast.FunctionDef, ast.arguments, ast.arg, ast.If,
               ast.Raise, ast.Return, ast.Expr, ast.Constant, ast.Call, ast.Name,
               ast.Load, ast.Compare, ast.Gt, ast.Lt, ast.GtE, ast.LtE, ast.Eq,
               ast.NotEq, ast.IfExp, ast.BoolOp, ast.And, ast.Or, ast.UnaryOp,
               ast.USub, ast.UAdd)
    nodes = list(ast.walk(tree))
    if len(nodes) > 150:
        raise ValueError('SOURCE_COMPLEXITY')
    for node in nodes:
        if not isinstance(node, allowed):
            raise ValueError('SOURCE_NODE_DENIED')
        if isinstance(node, ast.Name) and node.id not in {'value','lower','upper','min','max','ValueError','float','int'}:
            raise ValueError('SOURCE_NAME_DENIED')
        if isinstance(node, ast.Call) and (not isinstance(node.func, ast.Name) or node.func.id not in {'min','max','ValueError'} or node.keywords):
            raise ValueError('SOURCE_CALL_DENIED')
        if isinstance(node, ast.Constant) and (not isinstance(node.value,(str,int,float,type(None))) or isinstance(node.value,str) and len(node.value)>128):
            raise ValueError('SOURCE_CONSTANT_DENIED')
    return source


def launch_code(program):
    # Immutable prefix, supplied by the controller, never by the candidate.
    return """import os,resource,ctypes
assert ctypes.CDLL(None).prctl(38,1,0,0,0)==0
os.setgroups([]);os.setgid(10001);os.setuid(10001)
for k,v in [(resource.RLIMIT_AS,805306368),(resource.RLIMIT_CPU,6),(resource.RLIMIT_NPROC,24),(resource.RLIMIT_FSIZE,1048576),(resource.RLIMIT_NOFILE,64)]:resource.setrlimit(k,(v,v))
os.environ.clear();os.environ.update({'PATH':'/usr/local/bin:/usr/bin:/bin','HOME':'/home/runner','LANG':'C.UTF-8'})
os.execvp('python',['python','-c',""" + repr(program) + "] )"


def run_job(payload, report_path):
    import modal
    warnings.filterwarnings('ignore', message='Your Modal token .*')
    if set(payload) != {'jobId','artifact'} or set(payload['artifact']) != {'files','tests','action'} or set(payload['artifact']['files']) != {'clamp.py'} or payload['artifact']['action'] != 'run_tests':
        raise ValueError('ARTIFACT_SCOPE')
    artifact = payload['artifact']
    source = validate_source(artifact['files']['clamp.py'])
    if not isinstance(artifact['tests'],str) or not 1 <= len(artifact['tests']) <= 4000:
        raise ValueError('TEST_SCOPE')
    gate = json.loads(Path('/opt/data/sam-modal-gate-20261026-attempt2.json').read_text())
    if not gate['cleanup'] or not gate['guest']['allPassed'] or not gate['wallDeadline']['passed']:
        raise ValueError('LIVE_GATE_REQUIRED')
    report = {'jobId':payload['jobId'],'sourceHash':hashlib.sha256(source.encode()).hexdigest(),'stages':[],'complete':False}
    def save():
        Path(report_path).write_text(json.dumps(report,sort_keys=True));Path(report_path).chmod(0o600)
    save()
    app=modal.App.lookup('sam-hermes-isolation-gate',create_if_missing=False)
    image=modal.Image.debian_slim(python_version='3.12').dockerfile_commands('RUN useradd -m -u 10001 runner && mkdir -p /workspace && chown 10001:10001 /workspace','USER 10001:10001')
    for name,code,tests in [('wrong_control',BROKEN,INDEPENDENT),('hermes_requested_tests',source,artifact['tests']),('sam_independent_tests',source,INDEPENDENT)]:
        if time.time() >= payload_deadline():
            raise ValueError('CAMPAIGN_CLOSED')
        sb=None;stage={'name':name,'cleanup':False};report['stages'].append(stage);save()
        try:
            sb=modal.Sandbox.create('sleep','infinity',app=app,image=image,cpu=(0.5,0.5),memory=(1024,1024),timeout=90,block_network=True,env={},secrets=[],volumes={},network_file_systems={},include_oidc_identity_token=False,workdir='/workspace')
            stage['sandboxId']=sb.object_id;save()
            # The fixed runner imports the approved artifact in the guest. No eval/import on host.
            program="import pathlib,subprocess,json,hashlib\npathlib.Path('/workspace/clamp.py').write_text("+repr(code)+")\npathlib.Path('/workspace/test_case.py').write_text("+repr(tests)+")\nwith open('/workspace/output.log','wb') as f:\n p=subprocess.run(['python','/workspace/test_case.py'],stdout=f,stderr=f,timeout=10)\nb=pathlib.Path('/workspace/output.log').read_bytes()[:1048576]\nprint(json.dumps({'exitCode':p.returncode,'outputHash':hashlib.sha256(b).hexdigest(),'tail':b[-2048:].decode('utf8',errors='replace')}))"
            p=sb.exec('python','-c',launch_code(program),timeout=15)
            out=p.stdout.read();err=p.stderr.read();rc=p.wait()
            if rc!=0:raise ValueError('SANDBOX_HARNESS_FAILED')
            harness=json.loads(out);rc=harness['exitCode']
            stage['exitCode']=rc;stage['stdoutHash']=harness['outputHash'];stage['stderrHash']=hashlib.sha256(err.encode()).hexdigest()
            if name=='wrong_control':
                if rc==0:raise ValueError('WRONG_CODE_ACCEPTED')
                stage['rejected']=True
            elif rc!=0:raise ValueError('CANDIDATE_TEST_FAILED')
            elif name=='sam_independent_tests':
                result=json.loads(harness['tail']);assert result=={'passed':True,'assertions':46};stage['result']=result
        finally:
            if sb is not None:
                try:sb.terminate(wait=True);stage['cleanup']=sb.poll() is not None
                except Exception as e:stage['cleanup']=type(e).__name__ in ['SandboxTerminatedError','SandboxTimeoutError']
            save()
        if not stage['cleanup']:raise ValueError('CLEANUP_UNCONFIRMED')
    report['complete']=True;report['wrongCodeRejected']=True;report['independentAssertions']=46;save()
    return report


def payload_deadline():
    policy=json.loads(Path('/opt/data/sam-modal-coding-policy.json').read_text())
    if policy.get('enabled') is not True or policy.get('maxJobs') != 1:
        raise ValueError('CODING_POLICY_DISABLED')
    return float(policy['expiresAtEpoch'])


if __name__=='__main__':
    os.umask(0o077)
    try:
        body=sys.stdin.buffer.read(16385)
        if len(body)>16384:raise ValueError('BODY_TOO_LARGE')
        payload=json.loads(body)
        result=run_job(payload,sys.argv[1])
        print(json.dumps({'ok':True,'receipt':result},sort_keys=True))
    except Exception as exc:
        print(json.dumps({'ok':False,'error':str(exc) if isinstance(exc,ValueError) and str(exc).isupper() else type(exc).__name__}))
        sys.exit(1)
