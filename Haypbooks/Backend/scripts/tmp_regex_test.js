// Temporary regex debug script (moved into Haypbooks/Backend)
const fs = require('fs');
const path = require('path');
const sqlPath = path.resolve(__dirname, '..', 'prisma', 'migrations', 'phase19-lines-tenantid.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');
const name = 'InvoiceLine_tenant_fkey';
console.log('file length', sql.length, 'path', sqlPath);
console.log('connameRegex', new RegExp(`conname\s*=\s*'${name}'`, 'i').test(sql));
console.log('addConstraintRegex', new RegExp(`ALTER\s+TABLE[\s\S]*ADD\s+CONSTRAINT\s+"?${name}"?`, 'i').test(sql));
console.log('fkRegex', new RegExp(`FOREIGN\s+KEY\s*\([^)]*tenantId[^)]*\)[\s\S]*REFERENCES[\s\S]*"?Tenant"?`, 'i').test(sql));
console.log('inlineRefRegex', new RegExp(`tenantId[^,)]*REFERENCES[\s\S]*"?Tenant"?\s*\(\s*\"?id\"?\s*\)`, 'i').test(sql));
console.log('tableMention & referencesTenant', new RegExp('"?InvoiceLine"?', 'i').test(sql), new RegExp('REFERENCES[\s\S]*"?Tenant"?', 'i').test(sql));
