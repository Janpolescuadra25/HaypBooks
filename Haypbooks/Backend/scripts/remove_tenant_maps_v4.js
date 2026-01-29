const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
const pattern = /@map\(\s*["'\u201C\u201D`]?tenantId["'\u201C\u201D`]?\s*\)/g;
const before = (s.match(pattern) || []).length;
console.log('Matches before:', before);
if (before === 0) { console.log('Nothing to remove'); process.exit(0) }
const out = s.replace(pattern, '');
const after = (out.match(pattern) || []).length;
fs.writeFileSync(fp, out, 'utf8');
console.log('Removed', before - after, 'occurrences');
