const fs = require('fs');
const path = 'c:/Users/HomePC/Desktop/Haypbooksv9/Haypbooks/Frontend/tmp-practice-hub-jest.json';
const r = JSON.parse(fs.readFileSync(path, 'utf8'));
const fails = [];
for (const t of r.testResults) {
  const arr = Array.isArray(t.assertionResults) ? t.assertionResults : [];
  for (const a of arr) {
    if (a.status === 'failed') fails.push(a.fullName);
  }
}
console.log('FAIL_COUNT', fails.length);
for (const f of fails) console.log(f);
