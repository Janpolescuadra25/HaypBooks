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
let matches = [];
walk(path.resolve(__dirname, '..'), (fp) => {
  const ext = path.extname(fp);
  if (['.png','.jpg','.jpeg','.gif','.bin','.exe','.lock','.zip','.tar','.gz'].includes(ext)) return;
  try{
    const s = fs.readFileSync(fp,'utf8');
    if (s.includes('@map("tenantId")') || s.includes('@map(\\"tenantId\\")') ) {
      const lines = s.split(/\r?\n/);
      for (let i=0;i<lines.length;i++){
        if (lines[i].includes('@map("tenantId")') || lines[i].includes('@map(\\"tenantId\\")')) {
          matches.push({file: path.relative(process.cwd(), fp), line: i+1, text: lines[i].trim()});
        }
      }
    }
  }catch(e){}
});
if (matches.length===0) {
  console.log('No literal @map("tenantId") occurrences found across repo (excluding node_modules).');
  process.exit(0);
}
for (const m of matches) console.log(`${m.file}:${m.line} ${m.text}`);
console.log('Total matches:', matches.length);