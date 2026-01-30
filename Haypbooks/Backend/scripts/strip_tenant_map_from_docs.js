const fs = require('fs');
const path = require('path');
function walk(dir, cb) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      if (f === 'node_modules' || f === '.git') continue;
      walk(fp, cb);
    } else {
      cb(fp);
    }
  }
}
const root = path.resolve(__dirname, '..');
let changed = 0;
walk(root, (fp) => {
  if (!fp.includes('docs' + path.sep) && !fp.includes('docs' + '/')) return;
  const ext = path.extname(fp).toLowerCase();
  if (!['.md','.prisma','.txt',''].includes(ext)) return;
  try {
    let s = fs.readFileSync(fp, 'utf8');
    const before = (s.match(/@map\("tenantId"\)/g) || []).length + (s.match(/@@map\("Tenant"\)/g) || []).length;
    if (before === 0) return;
    s = s.replace(/@map\("tenantId"\)/g, '');
    s = s.replace(/@@map\("Tenant"\)/g, '');
    fs.writeFileSync(fp, s, 'utf8');
    console.log('Cleaned', before, 'occurrences in', path.relative(root, fp));
    changed += before;
  } catch (e) {
    // ignore binary files etc
  }
});
console.log('Total cleaned:', changed);