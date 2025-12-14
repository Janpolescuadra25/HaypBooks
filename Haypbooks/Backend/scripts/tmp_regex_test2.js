// Temporary regex debug script (moved into Haypbooks/Backend)
const fs = require('fs');
const path = require('path');
const sqlPath = path.resolve(__dirname, '..', 'prisma', 'migrations', 'phase19-lines-tenantid.sql');
const sql = fs.readFileSync(sqlPath,'utf8');
const tableName = 'InvoiceLine';
const name = `${tableName}_tenant_fkey`;
const addConstraintRegex = new RegExp(`ALTER\s+TABLE[\s\S]*ADD\s+CONSTRAINT\s+"?${name}"?`, 'i');
const alterFkExactRegex = new RegExp(`ALTER\s+TABLE[\s\S]*"?${tableName}"?[\s\S]*ADD\s+CONSTRAINT[\s\S]*REFERENCES[\s\S]*"?Tenant"?`, 'i');
console.log('path', sqlPath);
console.log('contains name', sql.includes(name));
console.log('addConstraintRegex', addConstraintRegex.test(sql));
console.log('alterFkExactRegex', alterFkExactRegex.test(sql));
