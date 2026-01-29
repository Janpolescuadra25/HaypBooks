const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
let lines = s.split(/\r?\n/);
const ln = 1508 - 1;
if (!lines[ln]) { console.log('No line'); process.exit(0) }
const line = lines[ln];
console.log('Line', ln+1, ':', JSON.stringify(line));
for (let i=0;i<line.length;i++){
  const ch = line[i];
  const code = line.charCodeAt(i);
  process.stdout.write(ch);
  if (i<line.length) process.stdout.write('('+(code)+') ');
}
console.log('\n-----');
