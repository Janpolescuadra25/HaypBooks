const fs = require('fs');
const path = require('path');
const buildOut = path.resolve(__dirname, '..', 'build2.out.txt');
const out = fs.readFileSync(buildOut, 'utf8');
const regex = /Error occurred prerendering page "([^"]+)"/g;
let m;
const routes = new Set();
while ((m = regex.exec(out))) {
  routes.add(m[1]);
}
console.log(`Found ${routes.size} prerender-error routes`);
for (const routeRaw of routes) {
  const route = routeRaw.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [
    path.join('src', 'app', '(owner)', route, 'page.tsx'),
    path.join('src', 'app', route, 'page.tsx'),
    path.join('src', 'app', '(owner)', route, 'page.jsx'),
    path.join('src', 'app', route, 'page.jsx'),
  ];
  const found = candidates.find(p => fs.existsSync(p));
  if (!found) {
    console.log(`Not found: ${routeRaw} -> tried ${candidates.join('; ')}`);
    continue;
  }
  let content = fs.readFileSync(found, 'utf8');
  if (!/^\s*['\"]use client['\"]/.test(content)) {
    fs.writeFileSync(found, "'use client'\n\n" + content, 'utf8');
    console.log(`Added use client to ${found}`);
  } else {
    console.log(`Already use client: ${found}`);
  }
}
