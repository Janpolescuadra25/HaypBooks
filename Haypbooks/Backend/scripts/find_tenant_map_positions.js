const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
let lines = s.split(/\r?\n/);
let count = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('@map("tenantId")')) {
    console.log('Found at line', i+1, ':', lines[i].trim());
    count++;
  }
}
console.log('Total found:', count);
