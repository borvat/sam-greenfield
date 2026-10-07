import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE work_queue (id TEXT PRIMARY KEY, fencing_token INTEGER, lease_owner TEXT, status TEXT, UNIQUE(id, fencing_token))')
con.execute("INSERT INTO work_queue VALUES ('q1',1,'a','LEASED')")
con.execute('UPDATE work_queue SET fencing_token=2, lease_owner="b" WHERE id="q1" AND fencing_token=1')
assert con.execute('SELECT fencing_token FROM work_queue WHERE id="q1"').fetchone()[0]==2
print('fencing test PASS')
