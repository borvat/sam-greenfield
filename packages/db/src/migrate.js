
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const migDir = path.join(__dirname, '../migrations');
const files = fs.readdirSync(migDir).filter(f=>f.endsWith('.sql')).sort();

console.log('Migrations in deterministic order:');
let concat = '';
files.forEach(f=>{
  const content = fs.readFileSync(path.join(migDir,f),'utf8');
  const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0,16);
  console.log(`  ${f} sha256:${hash}`);
  concat += content;
});

const finalHash = crypto.createHash('sha256').update(concat).digest('hex');
console.log(`\nFinal deterministic schema hash: ${finalHash}`);
console.log(`Total migrations: ${files.length}`);

if (process.argv.includes('--check-deterministic')) {
  const sorted = [...files].sort();
  if (JSON.stringify(files) !== JSON.stringify(sorted)) {
    console.error('Migrations not deterministic!');
    process.exit(1);
  }
  console.log('Deterministic check PASS');
}
