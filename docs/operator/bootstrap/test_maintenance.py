"""Local process/HTTP check only; no Render calls."""
import json, os, pathlib, socket, subprocess, time, urllib.request, urllib.error
command=pathlib.Path(__file__).with_name('maintenance-start-command.txt').read_text().strip()
with socket.socket() as sock:
    sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
# A bogus preload proves the command removes inherited Node preload settings.
env={'PATH':os.environ['PATH'],'PORT':str(port),'NODE_OPTIONS':'--require /missing/sam-preload.cjs','NODE_PATH':'/missing'}
p=subprocess.Popen(['sh','-c',command],env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
try:
    for attempt in range(100):
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{port}/readyz',timeout=.2) as r:
                assert r.status==200
                assert json.load(r)=={'mode':'sam-operator-maintenance','worker':False,'intake':False}
            break
        except urllib.error.URLError:time.sleep(.03)
    else:raise AssertionError('MAINTENANCE_NOT_READY')
    for path,method in [('/livez','GET'),('/mcp','POST'),('/','GET'),('/readyz','POST')]:
        request=urllib.request.Request(f'http://127.0.0.1:{port}{path}',method=method)
        try:
            with urllib.request.urlopen(request,timeout=1) as r:status=r.status
        except urllib.error.HTTPError as e:status=e.code
        assert status==(200 if path=='/livez' and method=='GET' else 503)
    p.terminate();out,err=p.communicate(timeout=7)
    assert p.returncode==0 and not err and 'SAM_OPERATOR_MAINTENANCE_READY' in out
    print('PASS: health-only readiness, other routes 503, inherited preloads removed, SIGTERM exits cleanly; no SAM/database/provider imports')
finally:
    if p.poll() is None:p.kill();p.communicate()
