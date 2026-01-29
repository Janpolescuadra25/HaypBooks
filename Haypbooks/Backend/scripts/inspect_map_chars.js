const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
let idx = s.indexOf('@map');
let count = 0;
while (idx !== -1 && count < 10) {
  const snippet = s.slice(Math.max(0, idx-10), idx+30);
  console.log('Occurrence', count+1, 'at', idx, JSON.stringify(snippet));
  for (let i=0;i<snippet.length;i++){
    const ch = snippet[i];
    const code = snippet.charCodeAt(i);
    process.stdout.write(ch+`(${code}) `);
  }
  console.log('\n---');
  idx = s.indexOf('@map', idx+1);
  count++;
}
console.log('Done');
