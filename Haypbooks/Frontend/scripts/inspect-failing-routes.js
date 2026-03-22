const fs = require('fs');
const path = require('path');
const buildFile = path.resolve(__dirname, '..', 'build4.out.txt');
const text = fs.readFileSync(buildFile, 'utf8');
const regex = /Error occurred prerendering page "([^"]+)"/g;
const routes = [];
let m;
while ((m = regex.exec(text))) {
  if (!routes.includes(m[1])) routes.push(m[1]);
}
const info = [];
for (const routeRaw of routes) {
  const route = routeRaw.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [
    path.join('src','app','(owner)',route,'page.tsx'),
    path.join('src','app',route,'page.tsx')
  ];
  const found = candidates.find(p => fs.existsSync(p));
  info.push({ route: routeRaw, found, candidates});
}
for (const i of info) {
  if (!i.found) {
    console.log(`NOT FOUND ${i.route} -> ${i.candidates.join(' ; ')}`);
  } else {
    const content = fs.readFileSync(i.found,'utf8');
    const firstLines = content.split(/\r?\n/).slice(0,15).join('\n');
    const isClient = /^\s*['\"]use client['\"]/.test(content);
    console.log(`---\n${i.route} (${i.found}) useClient=${isClient}\n${firstLines}\n`);
  }
}
