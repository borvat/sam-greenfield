"""Local fake child tests only: never connects to a database or prompts for real credentials."""
import os, pathlib, pty, select, subprocess, tempfile, time
SCRIPT=pathlib.Path(__file__).with_name('owner-setup.py').resolve()
SECRET='postgres://fixture:fixture-secret@fixture/db'
with tempfile.TemporaryDirectory() as directory:
    path=pathlib.Path(directory)
    node=path/'node'
    node.write_text('''#!/usr/bin/env python3
import json,os,sys
if sys.argv[-1]=='preflight':
 print('MOCK_PREFLIGHT',flush=True)
 sys.exit(int(os.environ.get('MOCK_PREFLIGHT_EXIT','0')))
data=json.loads(sys.stdin.read())
assert data['connection']==os.environ['MOCK_EXPECTED']
assert data['connection'] not in ' '.join(sys.argv)
print('MOCK_APPLY_PIPE_PASS',flush=True)
''')
    node.chmod(0o700)
    for case in ['success','cancel','preflight_failure']:
        pid,fd=pty.fork()
        if pid==0:
            os.environ['PATH']=directory+':'+os.environ['PATH']
            os.environ['MOCK_EXPECTED']=SECRET
            os.environ['MOCK_PREFLIGHT_EXIT']='1' if case=='preflight_failure' else '0'
            os.execv('/usr/bin/python3',['python3',str(SCRIPT)])
        output=b'';confirm=False;secret=False;status=None;deadline=time.monotonic()+8
        while time.monotonic()<deadline:
            if select.select([fd],[],[],.1)[0]:
                try: chunk=os.read(fd,8192)
                except OSError: chunk=b''
                output+=chunk
                if b'Type APPLY:' in output and not confirm:
                    os.write(fd,b'APPLY\n' if case=='success' else b'NO\n');confirm=True
                if b'(hidden; never paste in chat):' in output and not secret:
                    os.write(fd,(SECRET+'\n').encode());secret=True
            done,st=os.waitpid(pid,os.WNOHANG)
            if done:status=st;break
        if status is None:
            os.kill(pid,9);os.waitpid(pid,0);raise AssertionError('PTY_TIMEOUT')
        os.close(fd)
        assert SECRET.encode() not in output,output
        assert (os.waitstatus_to_exitcode(status)==0)==(case=='success'),output
        assert (b'MOCK_APPLY_PIPE_PASS' in output)==(case=='success'),output
        if case=='preflight_failure':assert not confirm and not secret
        print('PASS '+case+': no credential echo; correct dispatch boundary')
    result=subprocess.run(['/usr/bin/python3',str(SCRIPT)],input='',capture_output=True,text=True)
    assert result.returncode==1 and 'INTERACTIVE' not in result.stdout
    print('PASS noninteractive refusal')
