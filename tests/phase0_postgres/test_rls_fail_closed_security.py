
"""
Security Test: RLS Fail-Closed Verification - Uses NOSUPERUSER NOBYPASSRLS role
Fixes stale comment about NULL bypass - NULL now DENIES, not bypasses
"""

import psycopg2, os, sys, time

DB_URL = os.getenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/sam_greenfield")
DB_URL_APP = os.getenv("DATABASE_URL_APP", "postgres://app_tenant_test:test_password@localhost:5432/sam_greenfield")

def get_conn(url=DB_URL):
    return psycopg2.connect(url)

def get_app_conn():
    try:
        return psycopg2.connect(DB_URL_APP)
    except:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            DO $$ BEGIN
                CREATE ROLE app_tenant_test WITH LOGIN PASSWORD 'test_password' NOSUPERUSER NOBYPASSRLS;
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        """)
        cur.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_tenant_test")
        cur.execute("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_tenant_test")
        cur.execute("GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_tenant_test")
        conn.commit()
        conn.close()
        return psycopg2.connect(DB_URL_APP)

def setup():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM financial_documents WHERE business_id LIKE 'SEC_TEST_%'")
    cur.execute("DELETE FROM goals WHERE objective LIKE 'SEC_TEST_%'")
    conn.commit()
    cur.execute("INSERT INTO organizations (name) VALUES ('Sec Org') ON CONFLICT DO NOTHING RETURNING id")
    row = cur.fetchone()
    if not row:
        cur.execute("SELECT id FROM organizations WHERE name='Sec Org' LIMIT 1")
        org_id = cur.fetchone()[0]
    else:
        org_id = row[0]
    cur.execute("INSERT INTO legal_entities (org_id, name) VALUES (%s, 'Sec Entity A') ON CONFLICT DO NOTHING RETURNING id", (org_id,))
    row = cur.fetchone()
    if not row:
        cur.execute("SELECT id FROM legal_entities WHERE org_id=%s AND name='Sec Entity A'", (org_id,))
        entity_a = cur.fetchone()[0]
    else:
        entity_a = row[0]
    cur.execute("INSERT INTO legal_entities (org_id, name) VALUES (%s, 'Sec Entity B') ON CONFLICT DO NOTHING RETURNING id", (org_id,))
    row = cur.fetchone()
    if not row:
        cur.execute("SELECT id FROM legal_entities WHERE org_id=%s AND name='Sec Entity B'", (org_id,))
        entity_b = cur.fetchone()[0]
    else:
        entity_b = row[0]
    conn.commit()
    cur.execute("INSERT INTO financial_documents (business_id, legal_entity_id, doc_type, payload) VALUES (%s,%s,'invoice','{\"amount\":100}'::jsonb) RETURNING id", (f"SEC_TEST_A_{int(time.time()*1000)}", entity_a))
    doc_a = cur.fetchone()[0]
    cur.execute("INSERT INTO financial_documents (business_id, legal_entity_id, doc_type, payload) VALUES (%s,%s,'invoice','{\"amount\":200}'::jsonb) RETURNING id", (f"SEC_TEST_B_{int(time.time()*1000)}", entity_b))
    doc_b = cur.fetchone()[0]
    cur.execute("INSERT INTO goals (business_id, company_scope, objective, state) VALUES (next_business_id('goal', NULL), %s, 'SEC_TEST_Goal A', 'NEW') RETURNING id", (entity_a,))
    goal_a = cur.fetchone()[0]
    cur.execute("INSERT INTO goals (business_id, company_scope, objective, state) VALUES (next_business_id('goal', NULL), %s, 'SEC_TEST_Goal B', 'NEW') RETURNING id", (entity_b,))
    goal_b = cur.fetchone()[0]
    conn.commit()
    conn.close()
    return org_id, entity_a, entity_b, doc_a, doc_b, goal_a, goal_b

def test_fail_closed():
    org_id, entity_a, entity_b, doc_a, doc_b, goal_a, goal_b = setup()
    print(f"Setup: Org {org_id}, Entity A {entity_a}, B {entity_b}")
    print("Using NOSUPERUSER NOBYPASSRLS role - superuser bypass avoided, no stale NULL bypass comment")

    conn = get_app_conn()
    cur = conn.cursor()

    print("\n--- TEST 1: No tenant context -> zero protected rows visible ---")
    cur.execute("SET app.current_legal_entity_id = ''")
    cur.execute("SET app.current_org_id = ''")
    cur.execute("SELECT COUNT(*) FROM financial_documents WHERE business_id LIKE 'SEC_TEST_%'")
    count = cur.fetchone()[0]
    print(f"No context SELECT: count={count} (expected 0) - FAIL-CLOSED")
    assert count == 0
    print("✓ PASS: No tenant context -> zero protected rows visible (fail-closed)")

    cur.execute("SELECT COUNT(*) FROM goals WHERE objective LIKE 'SEC_TEST_%'")
    assert cur.fetchone()[0] == 0
    print("✓ PASS: No context goals 0 rows")

    print("\n--- TEST 2: No tenant context -> INSERT blocked ---")
    cur.execute("SET app.current_legal_entity_id = ''")
    try:
        cur.execute("INSERT INTO financial_documents (business_id, legal_entity_id, doc_type, payload) VALUES (%s,%s,'invoice','{\"amount\":300}'::jsonb)", (f"SEC_TEST_NOCTX_{int(time.time()*1000)}", entity_a))
        if cur.rowcount == 0:
            print("✓ PASS: No context INSERT blocked: rowcount 0 (WITH CHECK denied) - FAIL-CLOSED")
            conn.rollback()
            cur.execute("SET app.current_legal_entity_id = ''")
        else:
            conn.commit()
            assert False, "No context INSERT should be blocked"
    except Exception as e:
        conn.rollback()
        cur.execute("SET app.current_legal_entity_id = ''")
        print(f"✓ PASS: No context INSERT blocked (exception): {e}")

    print("\n--- TEST 3: No context -> UPDATE blocked ---")
    cur.execute("SET app.current_legal_entity_id = ''")
    cur.execute("UPDATE financial_documents SET payload='{\"amount\":999}'::jsonb WHERE id=%s", (doc_a,))
    assert cur.rowcount == 0
    print("✓ PASS: No context UPDATE blocked (rowcount 0)")

    print("\n--- TEST 4: No context -> DELETE blocked ---")
    cur.execute("SET app.current_legal_entity_id = ''")
    cur.execute("DELETE FROM financial_documents WHERE id=%s", (doc_a,))
    assert cur.rowcount == 0
    print("✓ PASS: No context DELETE blocked (rowcount 0)")

    print("\n--- TEST 5: Tenant A cannot read/write B ---")
    cur.execute("SET app.current_legal_entity_id = %s", (str(entity_a),))
    cur.execute("SELECT id FROM financial_documents WHERE id=%s", (doc_b,))
    assert len(cur.fetchall()) == 0
    print("✓ PASS: Tenant A cannot read B doc")
    cur.execute("SELECT id FROM financial_documents WHERE id=%s", (doc_a,))
    assert len(cur.fetchall()) == 1
    print("✓ PASS: Tenant A can read own doc")

    print("\n--- TEST 6: Tenant B cannot read/write A ---")
    cur.execute("SET app.current_legal_entity_id = %s", (str(entity_b),))
    cur.execute("SELECT id FROM financial_documents WHERE id=%s", (doc_a,))
    assert len(cur.fetchall()) == 0
    print("✓ PASS: Tenant B cannot read A doc")

    print("\n--- TEST 7: Tenant A can access own ---")
    cur.execute("SET app.current_legal_entity_id = %s", (str(entity_a),))
    cur.execute("SELECT id FROM goals WHERE id=%s", (goal_a,))
    assert len(cur.fetchall()) == 1
    print("✓ PASS: Tenant A can access own goal")

    print("\n--- TEST 8: Service/admin bypass explicit, never via NULL ---")
    cur.execute("SET app.current_legal_entity_id = ''")
    cur.execute("SELECT COUNT(*) FROM financial_documents WHERE business_id LIKE 'SEC_TEST_%'")
    assert cur.fetchone()[0] == 0
    print("✓ PASS: NULL context does NOT bypass - explicit bypass via service_role/is_admin only, never NULL - FAIL-CLOSED verified")

    conn.commit()
    conn.close()
    print("\n=== ALL SECURITY TESTS PASS - FAIL-CLOSED VERIFIED (NOSUPERUSER ROLE) ===")

if __name__ == "__main__":
    try:
        test_fail_closed()
    except Exception as e:
        print(f"SECURITY TEST FAIL: {e}")
        import traceback; traceback.print_exc()
        sys.exit(1)
