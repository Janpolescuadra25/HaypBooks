const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
let idx = s.indexOf('@map');
if (idx === -1) { console.log('No @map found'); process.exit(0) }
let snippet = s.slice(idx, idx+30);
console.log('Snippet:', JSON.stringify(snippet));
console.log('Chars:');
for (let i = 0; i < snippet.length; i++) {
  console.log(i, snippet[i], snippet.charCodeAt(i));
}
