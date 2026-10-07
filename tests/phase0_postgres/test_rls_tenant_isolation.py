
"""
Real RLS Tenant Isolation Test - Uses NOSUPERUSER NOBYPASSRLS role to avoid superuser bypass
Proves tenant isolation with actual RLS policies fail-closed
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

def setup_entities():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM financial_documents WHERE business_id LIKE 'TEST_RLS_%'")
    cur.execute("DELETE FROM goals WHERE objective LIKE 'TEST_RLS_%'")
    conn.commit()
    cur.execute("INSERT INTO organizations (name) VALUES ('Test Org RLS') ON CONFLICT DO NOTHING RETURNING id")
    row = cur.fetchone()
    if not row:
        cur.execute("SELECT id FROM organizations WHERE name='Test Org RLS' LIMIT 1")
        org_id = cur.fetchone()[0]
    else:
        org_id = row[0]
    cur.execute("INSERT INTO legal_entities (org_id, name) VALUES (%s, 'Entity A BV') ON CONFLICT DO NOTHING RETURNING id", (org_id,))
    row = cur.fetchone()
    if not row:
        cur.execute("SELECT id FROM legal_entities WHERE org_id=%s AND name='Entity A BV'", (org_id,))
        entity_a = cur.fetchone()[0]
    else:
        entity_a = row[0]
    cur.execute("INSERT INTO legal_entities (org_id, name) VALUES (%s, 'Entity B BV') ON CONFLICT DO NOTHING RETURNING id", (org_id,))
    row = cur.fetchone()
    if not row:
        cur.execute("SELECT id FROM legal_entities WHERE org_id=%s AND name='Entity B BV'", (org_id,))
        entity_b = cur.fetchone()[0]
    else:
        entity_b = row[0]
    conn.commit()
    # Insert data as superuser (bypasses RLS for setup)
    cur.execute("INSERT INTO financial_documents (business_id, legal_entity_id, doc_type, payload, issued_at, is_immutable) VALUES (%s,%s,'invoice','{\"amount\":100}'::jsonb, now(), false) RETURNING id", (f"TEST_RLS_A_{int(time.time()*1000)}", entity_a))
    doc_a_id = cur.fetchone()[0]
    cur.execute("INSERT INTO financial_documents (business_id, legal_entity_id, doc_type, payload, issued_at, is_immutable) VALUES (%s,%s,'invoice','{\"amount\":200}'::jsonb, now(), false) RETURNING id", (f"TEST_RLS_B_{int(time.time()*1000)}", entity_b))
    doc_b_id = cur.fetchone()[0]
    cur.execute("INSERT INTO goals (business_id, company_scope, objective, state) VALUES (next_business_id('goal', NULL), %s, 'TEST_RLS_Goal A', 'NEW') RETURNING id", (entity_a,))
    goal_a_id = cur.fetchone()[0]
    cur.execute("INSERT INTO goals (business_id, company_scope, objective, state) VALUES (next_business_id('goal', NULL), %s, 'TEST_RLS_Goal B', 'NEW') RETURNING id", (entity_b,))
    goal_b_id = cur.fetchone()[0]
    conn.commit()
    conn.close()
    return org_id, entity_a, entity_b, doc_a_id, doc_b_id, goal_a_id, goal_b_id

def test_rls_tenant_isolation():
    org_id, entity_a, entity_b, doc_a_id, doc_b_id, goal_a_id, goal_b_id = setup_entities()
    print(f"Entities: Org {org_id}, A {entity_a}, B {entity_b}")
    print(f"Docs: A {doc_a_id}, B {doc_b_id}")
    print("Using NOSUPERUSER NOBYPASSRLS role app_tenant_test to prove superuser bypass avoided")

    # Use app role for all isolation assertions - proves RLS, not superuser bypass
    conn = get_app_conn()
    cur = conn.cursor()

    # No context -> zero rows (fail-closed)
    cur.execute("SET app.current_legal_entity_id = ''")
    cur.execute("SET app.current_org_id = ''")
    cur.execute("SELECT COUNT(*) FROM financial_documents WHERE business_id LIKE 'TEST_RLS_%'")
    count = cur.fetchone()[0]
    print(f"No context SELECT financial_documents (app role): count={count} (expected 0) - FAIL-CLOSED")
    assert count == 0, f"FAIL-OPEN: No context should see 0, saw {count}"
    print("✓ PASS: No tenant context -> zero protected rows visible (fail-closed, app role)")

    # Entity A can read own, not B
    cur.execute("SET app.current_legal_entity_id = %s", (str(entity_a),))
    cur.execute("SELECT id FROM financial_documents WHERE id=%s", (doc_b_id,))
    assert len(cur.fetchall()) == 0
    print("✓ PASS: Tenant A cannot read B doc (app role)")

    cur.execute("SELECT id FROM financial_documents WHERE id=%s", (doc_a_id,))
    assert len(cur.fetchall()) == 1
    print("✓ PASS: Tenant A can read own doc (app role)")

    cur.execute("UPDATE financial_documents SET payload='{\"amount\":999}'::jsonb WHERE id=%s", (doc_b_id,))
    assert cur.rowcount == 0
    print("✓ PASS: Tenant A cannot UPDATE B doc (app role, rowcount 0)")

    cur.execute("SET app.current_legal_entity_id = %s", (str(entity_b),))
    cur.execute("SELECT id FROM financial_documents WHERE id=%s", (doc_a_id,))
    assert len(cur.fetchall()) == 0
    print("✓ PASS: Tenant B cannot read A doc (app role)")

    cur.execute("SELECT id FROM financial_documents WHERE id=%s", (doc_b_id,))
    assert len(cur.fetchall()) == 1
    print("✓ PASS: Tenant B can read own doc (app role)")

    cur.execute("SET app.current_legal_entity_id = ''")
    cur.execute("SET app.current_org_id = ''")
    conn.commit()
    conn.close()

    print("\n=== RLS Tenant Isolation Real Test PASS (NOSUPERUSER role) ===")
    print("Proves isolation with actual RLS policies, superuser bypass avoided")

if __name__ == "__main__":
    try:
        test_rls_tenant_isolation()
    except Exception as e:
        print(f"FAIL: {e}")
        import traceback; traceback.print_exc()
        sys.exit(1)
