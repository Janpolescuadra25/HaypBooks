const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/app/**/page.tsx');
let count = 0;
for (const file of files) {
  const content = fs.readFileSync(file,'utf8');
  if (/export\s+const\s+metadata\s*=/.test(content) && /^\s*['\"]use client['\"]/.test(content)) {
    // Remove first 'use client' statement + following blank line if present.
    const lines = content.split(/\r?\n/);
    let i = 0;
    if (/^\s*['\"]use client['\"]/.test(lines[i])) {
      i++;
      if (i < lines.length && /^\s*$/.test(lines[i])) { i++; }
    }
    const newContent = lines.slice(i).join('\n');
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
    console.log(`Removed use client from ${file}`);
  }
}
console.log(`Fixed ${count} metadata pages`);
