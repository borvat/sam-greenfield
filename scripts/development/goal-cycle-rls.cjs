// Only installed in a newly-created isolated cycle schema, never as a global migration.
async function installCycleRls(client, role) {
  if (!/^sam_(goal_cycle|drive_read)_(app|test_app)$/.test(role)) throw new Error("Invalid cycle role.");
  const driveRead = role.startsWith("sam_drive_read_");
  const scope = "(SELECT goal_id FROM development_cycle_scope)";
  const tenant = "EXISTS(SELECT 1 FROM development_cycle_scope)";
  const policy = async (table, expression, command = "ALL", restrictive = false) => {
    await client.query(`CREATE POLICY cycle_scope ON ${table} ${restrictive ? "AS RESTRICTIVE" : ""}
      FOR ${command} TO ${role} USING (${expression}) ${command === "ALL" ? `WITH CHECK (${expression})` : ""}`);
  };
  await policy("goals", `id=${scope}`, "ALL", true);
  for (const table of ["plans", "work_queue", "executions", "audit_log"]) {
    await policy(table, `goal_id=${scope}`);
  }
  if (!driveRead) await policy("development_office_results", `goal_id=${scope}`, "ALL", true);
  await policy("verifications", `EXISTS(SELECT 1 FROM executions e WHERE e.id=execution_id AND e.goal_id=${scope})`);
  await policy("outbox_events", `(
    aggregate_type='goal' AND aggregate_id=${scope}
    OR aggregate_type='work_queue' AND EXISTS(SELECT 1 FROM work_queue w WHERE w.id=aggregate_id AND w.goal_id=${scope})
    OR aggregate_type='execution' AND EXISTS(SELECT 1 FROM executions e WHERE e.id=aggregate_id AND e.goal_id=${scope})
    OR aggregate_type='verification' AND EXISTS(SELECT 1 FROM verifications v WHERE v.id=aggregate_id)
  )`);
  await policy("event_fabric_events", "source='outbox' AND EXISTS(SELECT 1 FROM outbox_events o WHERE o.id=outbox_ref)");
  if (!driveRead) {
    await policy("model_providers", `${tenant} AND provider_id='deepseek'`, "SELECT");
    await policy("model_calls", `${tenant} AND task='executive_planning' AND provider='deepseek'
      AND model ~ '^deepseek-(flash|v4([.]1)?-flash)(-[a-z0-9]+)*$' AND data_classification='PUBLIC'`);
  }
  await policy("verification_contracts", `${tenant} AND capability_id='${driveRead ? "drive_get_metadata" : "synthetic.office_task"}'`, "SELECT");
  // Memory, financial tables, users, approvals, side effects, and arbitrary events stay denied.
}
module.exports = { installCycleRls };
