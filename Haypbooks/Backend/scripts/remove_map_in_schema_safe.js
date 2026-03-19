const fs = require('fs');
const path = require('path');
function findSchema(start) {
  let cur = start;
  for (let i=0;i<10;i++){
    const candidate = path.join(cur, 'prisma', 'schema.prisma');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}
const fp = findSchema(__dirname);
if (!fp) {
  console.error('Could not find prisma/schema.prisma from', __dirname);
  process.exit(1);
}
let s = fs.readFileSync(fp,'utf8');
const before = (s.match(/@map\(\s*"tenantId"\s*\)/g) || []).length;
if (before === 0) {
  console.log('No @map("tenantId") occurrences found in', fp);
  process.exit(0);
}
const out = s.replace(/\s*@map\(\s*"tenantId"\s*\)/g, '');
fs.writeFileSync(fp, out, 'utf8');
console.log('Removed', before, '@map("tenantId") occurrences from', fp);
