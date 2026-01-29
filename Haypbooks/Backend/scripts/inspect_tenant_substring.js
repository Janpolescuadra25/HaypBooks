const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
let idx = s.indexOf('tenantId');
if (idx === -1) { console.log('No tenantId found'); process.exit(0) }
let start = Math.max(0, idx - 20);
let snippet = s.slice(start, idx + 20);
console.log('Snippet:', JSON.stringify(snippet));
for (let i = 0; i < snippet.length; i++) {
  const ch = snippet[i];
  const code = snippet.charCodeAt(i);
  process.stdout.write((i+start)+':'+ch+'('+code+') ');
}
console.log('\n');
