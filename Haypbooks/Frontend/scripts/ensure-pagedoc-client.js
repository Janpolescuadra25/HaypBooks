const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/app/**/page.tsx');
let count = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes("import PageDocumentation from '@/components/owner/PageDocumentation'") || content.includes('import PageDocumentation from "@/components/owner/PageDocumentation"') || content.includes('import PageDocumentation from \'@/components/owner/PageDocumentation\'')) {
    if (!/^\s*['\"]use client['\"]/.test(content)) {
      fs.writeFileSync(file, "'use client'\n\n" + content, 'utf8');
      console.log(`Added use client to ${file}`);
      count++;
    }
  }
}
console.log(`Total pages updated: ${count}`);
