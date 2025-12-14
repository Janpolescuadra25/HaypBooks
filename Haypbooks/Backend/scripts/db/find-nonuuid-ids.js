const fs = require('fs');
const path = require('path');
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function walk(dir, files = []) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p, files);
    } else if (p.endsWith('.ts') || p.endsWith('.js')) {
      files.push(p);
    }
  });
  return files;
}

const files = walk(path.join(process.cwd(), 'prisma'));
const res = [];
for (const file of files) {
  const s = fs.readFileSync(file, 'utf8');
  const regex = /id:\s*'([^']+)'/g;
  let m;
  while ((m = regex.exec(s)) !== null) {
    const idVal = m[1];
    if (!uuidRegex.test(idVal)) {
      res.push({ file, idVal, index: m.index });
    }
  }
}
console.log(JSON.stringify(res, null, 2));
