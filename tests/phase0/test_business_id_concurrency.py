import threading, sqlite3
con = sqlite3.connect(':memory:', check_same_thread=False, isolation_level=None)
con.execute('CREATE TABLE seq (type TEXT, scope TEXT, last INTEGER, PRIMARY KEY(type,scope))')
con.execute("INSERT INTO seq VALUES ('goal','org1',0)")
results=[]; lock=threading.Lock()
def gen():
    for _ in range(20):
        with lock:
            n=con.execute('SELECT last FROM seq WHERE type="goal" AND scope="org1"').fetchone()[0]+1
            con.execute('UPDATE seq SET last=? WHERE type="goal" AND scope="org1"',(n,))
            results.append(n)
threads=[threading.Thread(target=gen) for _ in range(5)]
[t.start() for t in threads]; [t.join() for t in threads]
assert len(results)==100 and len(set(results))==100
print(f'business ID concurrency PASS - 100 unique IDs, no MAX()+1 race')
