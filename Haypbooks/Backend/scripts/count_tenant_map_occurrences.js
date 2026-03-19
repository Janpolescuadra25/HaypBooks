const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
const s = fs.readFileSync(fp,'utf8');
let idx = s.indexOf('@map("tenantId")');
let count = 0;
while (idx !== -1) {
  count++;
  console.log('Found at index', idx);
  idx = s.indexOf('@map("tenantId")', idx+1);
}
console.log('Total found (literal):', count);
// Also try variant with single quotes
let idx2 = s.indexOf("@map('tenantId')");
let count2 = 0;
while (idx2 !== -1) { count2++; idx2 = s.indexOf("@map('tenantId')", idx2+1) }
console.log('Total found (single-quote literal):', count2);
