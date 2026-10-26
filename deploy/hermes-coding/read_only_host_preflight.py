"""Finite operator-only preflight for the approved isolated round.

No generated code, model run, sandbox creation, credential refresh, new App,
database write, tool policy change, subscription or resource provisioning.
The existing pinned gateway launcher is left intact and runs separately.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT=Path('/opt/data/sam-real-ui-round-20261026')
SDK=Path('/tmp/sam-modal-sdk/bin/python')
SDK_CHECK='''import json,importlib.metadata
try:
 import modal
 assert importlib.metadata.version('modal')=='1.6.2'
 try:
  app=modal.App.lookup('sam-hermes-isolation-gate',create_if_missing=False)
  result={'sdk':'1.6.2','readOnlyLookup':'OK','appId':app.app_id}
 except Exception as e:
  result={'sdk':'1.6.2','readOnlyLookup':type(e).__name__}
except Exception as e:
 result={'sdk':'UNAVAILABLE','readOnlyLookup':type(e).__name__}
print(json.dumps(result))
'''

def inspect():
    report={'kind':'APPROVED_ROUND_READONLY_HOST_PREFLIGHT','newRoundCeilingUsd':1,
        'guestCreations':0,'modelCalls':0,'publisherActivated':False,
        'originalGatewayLauncherUnmodified':True}
    # Normal existing startup installs its previously pinned SDK into /tmp.
    # Wait only for that known executable; this observer installs nothing.
    deadline=time.monotonic()+55
    while not SDK.is_file() and time.monotonic()<deadline:time.sleep(1)
    report['sdkExecutablePresent']=SDK.is_file()
    for name,path in [('modalCredentialPresent','/opt/data/sam-modal-acceptance.toml'),
                      ('priorBrokerStatePresent','/opt/data/sam-modal-coding-jobs.sqlite')]:
        p=Path(path);report[name]=p.is_file() and not p.is_symlink()
    if SDK.is_file() and report['modalCredentialPresent']:
        try:
            result=subprocess.run([str(SDK),'-c',SDK_CHECK],
                env={'PATH':'/usr/bin:/bin','MODAL_CONFIG_PATH':'/opt/data/sam-modal-acceptance.toml'},
                stdin=subprocess.DEVNULL,text=True,capture_output=True,timeout=20)
            data=json.loads(result.stdout)
            if set(data)-{'sdk','readOnlyLookup','appId'}:raise ValueError('UNEXPECTED_OUTPUT')
            report['modalReadOnly']=data
        except Exception as e:report['modalReadOnly']={'readOnlyLookup':type(e).__name__}
    (ROOT/'preflight.json').write_text(json.dumps(report,sort_keys=True))
    (ROOT/'preflight.json').chmod(0o600)
    print(json.dumps(report,sort_keys=True),flush=True)

def main():
    if os.getuid()!=0:raise RuntimeError('ROOT_OPERATOR_ONLY')
    os.umask(0o077)
    if ROOT.is_symlink():raise RuntimeError('OPERATOR_PATH_DENIED')
    ROOT.mkdir(mode=0o700,exist_ok=True)
    if ROOT.stat().st_uid!=0 or ROOT.stat().st_mode&0o077:raise RuntimeError('OPERATOR_PATH_DENIED')
    if len(sys.argv)>1 and sys.argv[1]=='inspect':
        inspect();return
    if (ROOT/'preflight.json').exists():
        # Read-only inspection is not re-dispatched after another container start.
        print('APPROVED_ROUND_PREFLIGHT_ALREADY_RECORDED',flush=True);return
    path=ROOT/'read-only-preflight.py'
    if path.is_symlink():raise RuntimeError('OPERATOR_PATH_DENIED')
    source=Path(__file__).read_bytes()
    if path.exists() and path.read_bytes()!=source:raise RuntimeError('OPERATOR_SOURCE_CONFLICT')
    if not path.exists():path.write_bytes(source);path.chmod(0o600)
    # No secret environment inheritance. The observer knows the single fixed
    # root-only Modal configuration path; it never prints or transfers its bytes.
    subprocess.Popen([sys.executable,str(path),'inspect'],stdin=subprocess.DEVNULL,
        env={'PATH':os.environ.get('PATH','/usr/bin:/bin')},close_fds=True)
    print('APPROVED_ROUND_READONLY_PREFLIGHT_SCHEDULED',flush=True)

if __name__=='__main__':main()
