const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const liveValues = Object.entries(process.env)
  .filter(([key, value]) => /KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|DATABASE_URL/i.test(key) && value && value.length >= 12)
  .map(([, value]) => value);
const files = cp.execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0").filter(Boolean);
const evidence = ".local/sam-dev";
const logIndex=process.argv.indexOf("--log");
if(logIndex>=0&&process.argv[logIndex+1])files.push(process.argv[logIndex+1]);
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
const allHistory={requested:process.argv.includes("--history"),checkedBlobs:0,skippedLargeBlobs:0,currentSecretMatches:0,unexpectedTokenBlobs:0};
if(allHistory.requested){
  const objects=cp.execFileSync("git",["rev-list","--objects","--all"],{encoding:"utf8",maxBuffer:20_000_000})
    .trim().split("\n").map(line=>line.split(" ")[0]);
  const info=cp.execFileSync("git",["cat-file","--batch-check=%(objectname) %(objecttype) %(objectsize)"],{
    input:objects.join("\n")+"\n",encoding:"utf8",maxBuffer:20_000_000});
  for(const line of info.trim().split("\n")){
    const [hash,type,size]=line.split(" ");
    if(type!=="blob")continue;
    if(Number(size)>2_000_000){allHistory.skippedLargeBlobs++;continue;}
    const text=cp.execFileSync("git",["cat-file","blob",hash],{encoding:"utf8",maxBuffer:2_100_000});
    allHistory.checkedBlobs++;
    if(liveValues.some(value=>text.includes(value)))allHistory.currentSecretMatches++;
    const matches=text.match(/\b(?:sk-[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16})\b/g)??[];
    if(matches.some(value=>!/synthetic|fixture|fake|test|dummy|example/i.test(value)))allHistory.unexpectedTokenBlobs++;
  }
}
const report = {
  checkedAt: new Date().toISOString(), checkedFiles: new Set(files).size, currentSecretMatches: findings,
  potentialTokenLiterals: potential, trackedConfigHistoryCurrentSecretMatch: liveValues.some(value => history.includes(value)),
  trackedConfigHistoryPotentialKeyCount: historicalTokens.size,
  allHistory,
  scope: "Working tree, safe JSON evidence, optional log and all reachable Git blobs up to 2MB when --history is set; unknown secret formats not guaranteed",
  valuesNeverPrinted: true
};
fs.writeFileSync(".local/sam-dev/secret-scan-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
if (findings.length || potential.length || report.trackedConfigHistoryCurrentSecretMatch||
  allHistory.currentSecretMatches||allHistory.unexpectedTokenBlobs) process.exitCode = 1;
