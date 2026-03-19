const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
const before = (s.match(/@map\(("|')tenantId("|')\)/g) || []).length;
if (before === 0) { console.log('No exact @map("tenantId") tokens found in', fp); process.exit(0); }
const out = s.replace(/@map\(("|')tenantId("|')\)/g, '');
fs.writeFileSync(fp, out, 'utf8');
console.log('Removed', before, '@map("tenantId") tokens from', fp);
