const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
const s = fs.readFileSync(fp, 'utf8');
const lines = s.split(/\r?\n/);
let count=0;
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  if(line.includes('@map') && line.includes('tenantId')){
    console.log('Line', i+1, ':', line.trim());
    count++;
  }
}
console.log('Total lines with both @map and tenantId:', count);
