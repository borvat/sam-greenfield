const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const liveValues = Object.entries(process.env)
  .filter(([key, value]) => /KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|DATABASE_URL/i.test(key) && value && value.length >= 12)
  .map(([, value]) => value);
const files = cp.execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0").filter(Boolean);
const evidence = ".local/sam-dev";
if (fs.existsSync(evidence)) for (const name of fs.readdirSync(evidence)) if (name.endsWith(".json")) files.push(path.join(evidence, name));
const findings = [], potential = [];
for (const file of new Set(files)) {
  if (!fs.existsSync(file) || fs.statSync(file).size > 2_000_000 || !fs.statSync(file).isFile()) continue;
  const text = fs.readFileSync(file, "utf8");
  if (liveValues.some(value => text.includes(value))) findings.push({ file, kind: "current-secret-match" });
  const tokens = text.match(/\b(?:sk-[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16})\b/g) ?? [];
  if (tokens.some(value => !/synthetic|fixture|fake|test|dummy|example/i.test(value))) potential.push({ file, kind: "token-like-literal" });
}
// Review tracked config history without printing patches, token values, or their hashes.
const history = cp.execFileSync("git", ["log", "-p", "--", ".replit"], { encoding: "utf8", maxBuffer: 15_000_000 });
const historicalTokens = new Set((history.match(/\bsk-[A-Za-z0-9_-]{24,}\b/g) ?? [])
  .filter(value => !/synthetic|fixture|fake|test|dummy|example/i.test(value)));
const report = {
  checkedAt: new Date().toISOString(), checkedFiles: new Set(files).size, currentSecretMatches: findings,
  potentialTokenLiterals: potential, trackedConfigHistoryCurrentSecretMatch: liveValues.some(value => history.includes(value)),
  trackedConfigHistoryPotentialKeyCount: historicalTokens.size,
  scope: "Working tree and safe JSON evidence; config history only, not a complete all-blob history audit",
  valuesNeverPrinted: true
};
fs.writeFileSync(".local/sam-dev/secret-scan-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
if (findings.length || potential.length || report.trackedConfigHistoryCurrentSecretMatch) process.exitCode = 1;
