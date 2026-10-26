"""Isolated HTTP compatibility route; no native tool or model policy changes."""
import ast
import os
import pwd
from pathlib import Path
import subprocess
import sys
MARKER='        routes: list[tuple] = ['
REPLACEMENT='''        # SAM isolated artifact verifier; no model-facing host tool.
        if '/opt/data' not in sys.path:
            sys.path.insert(0, '/opt/data')
        from sam_modal_coding_proxy import handle as sam_coding_handle
        routes: list[tuple] = [
            ("POST", "/sam/coding/verify", sam_coding_handle),'''
def install():
    p=Path('/opt/hermes/gateway/platforms/api_server.py');data=p.read_text()
    if REPLACEMENT not in data:
        if data.count(MARKER)!=1:raise RuntimeError('CODING_ROUTE_SOURCE_MISMATCH')
        backup=Path('/opt/data/sam-api-server-before-coding.py')
        if backup.exists() and backup.read_text()!=data:raise RuntimeError('CODING_SOURCE_CHANGED_REVIEW')
        if not backup.exists():backup.write_text(data);backup.chmod(0o600)
        changed=data.replace(MARKER,REPLACEMENT,1);ast.parse(changed);p.write_text(changed)
    else:ast.parse(data)
    sdk=Path('/tmp/sam-modal-sdk/bin/python')
    if not sdk.exists():subprocess.run([sys.executable,'-m','venv','/tmp/sam-modal-sdk'],check=True,timeout=40)
    check=subprocess.run([str(sdk),'-c','import importlib.metadata;assert importlib.metadata.version("modal")=="1.6.2"'],capture_output=True)
    if check.returncode:
        result=subprocess.run([str(sdk),'-m','pip','install','--no-cache-dir','--disable-pip-version-check','--quiet','modal==1.6.2'],capture_output=True,timeout=120)
        if result.returncode:raise RuntimeError('CODING_SDK_INSTALL_FAILED')
    identity=pwd.getpwnam('hermes')
    proxy=Path('/opt/data/sam_modal_coding_proxy.py')
    if proxy.is_symlink() or not proxy.is_file():raise RuntimeError('CODING_PROXY_SCOPE_DENIED')
    os.chown(proxy,identity.pw_uid,identity.pw_gid);proxy.chmod(0o400)
    # Credentials, policy, gate and broker stay root-only; the gateway gets a fixed proxy.
    for name in ('sam_modal_coding_broker.py','sam-modal-coding-worker.py','sam-modal-acceptance.toml','sam-modal-gate-20261026-attempt2.json','sam-modal-coding-policy.json'):
        target=Path('/opt/data')/name
        if target.is_symlink() or not target.is_file():raise RuntimeError('CODING_FILE_SCOPE_DENIED')
        if target.stat().st_uid!=0 or target.stat().st_mode&0o077:raise RuntimeError('CODING_SECRET_PERMISSIONS_DENIED')
    log=os.open('/opt/data/sam-coding-broker.log',os.O_WRONLY|os.O_CREAT|os.O_APPEND,0o600)
    subprocess.Popen([sys.executable,'/opt/data/sam_modal_coding_broker.py'],stdin=subprocess.DEVNULL,stdout=log,stderr=log,start_new_session=True)
    os.close(log)
    print('SAM_CODING_ROUTE_READY')
if __name__=='__main__':install()
