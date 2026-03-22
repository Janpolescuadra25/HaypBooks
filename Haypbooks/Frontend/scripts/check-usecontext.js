const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/app/**/*.tsx');
const useContextFiles = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('useContext(')) {
    useContextFiles.push(file);
  }
}
const missing = [];
for (const file of useContextFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (!/^\s*['\"]use client['\"]/.test(text)) missing.push(file);
}
console.log('useContext files total', useContextFiles.length);
console.log('missing use client', missing.length);
missing.forEach((f) => console.log(f));
