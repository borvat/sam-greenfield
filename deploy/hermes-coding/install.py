"""Isolated HTTP compatibility route; no native tool or model policy changes."""
import ast
from pathlib import Path
import subprocess
import sys
MARKER='        routes: list[tuple] = ['
REPLACEMENT='''        # SAM isolated artifact verifier; no model-facing host tool.
        if '/opt/data' not in sys.path:
            sys.path.insert(0, '/opt/data')
        from sam_modal_coding_broker import handle as sam_coding_handle
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
    print('SAM_CODING_ROUTE_READY')
if __name__=='__main__':install()
