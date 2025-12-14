import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../');
const MIGRATIONS_DIR = path.join(ROOT, 'prisma', 'migrations');

const BAD_PATTERNS = [
  /ADD\s+CONSTRAINT\s+IF\s+NOT\s+EXISTS/i,
  /ALTER\s+TABLE\s+IF\s+EXISTS/i,
];

// Additional safety checks for unguarded DDL: find ALTER TABLE, CREATE INDEX, DROP COLUMN on public tables without surrounding information_schema checks
const UNGUARDED_DDL = [
  /ALTER\s+TABLE\s+public\."([^"]+)"\s+ADD\s+CONSTRAINT/i,
  /ALTER\s+TABLE\s+public\."([^"]+)"\s+DROP\s+COLUMN/i,
  /ALTER\s+TABLE\s+public\."([^"]+)"\s+DROP\s+CONSTRAINT/i,
  /CREATE\s+INDEX\s+([a-z0-9_]+)\s+ON\s+public\."([^"]+)"\s*\(\s*"tenantId"\s*\)/i,
];

function stripComments(sql: string): string {
  // Remove single-line comments
  let s = sql.replace(/--.*$/gm, '');
  // Remove multi-line comments
  s = s.replace(/\/\*[\s\S]*?\*\//gm, '');
  return s;
}

function scanFile(filePath: string): string[] {
  const raw = fs.readFileSync(filePath, 'utf8');
  const content = stripComments(raw);
  const hits: string[] = [];
  for (const pattern of BAD_PATTERNS) {
    if (pattern.test(content)) hits.push(pattern.source);
  }
  // flag unguarded DDL usage
  for (const pattern of UNGUARDED_DDL) {
    let match: RegExpExecArray | null;
    const re = new RegExp(pattern, 'gi');
    while ((match = re.exec(content)) !== null) {
      const table = match[1];
      // allow if pg_constraint guard exists or if information_schema tables/columns check exists
      const pgConstraintGuard = /pg_constraint/.test(content);
      const infoSchemaGuard = new RegExp(`information_schema\\.(tables|columns).+${table}`, 'i');
      if (!pgConstraintGuard && !infoSchemaGuard.test(content)) {
        hits.push(`ungarded:${pattern}`);
        break;
      }
    }
  }
  // detect nested DO $$ blocks which cause syntax errors in older Postgres migration runners
  const doBlocks = content.match(/DO\s+\$\$[\s\S]*?END\$\$;?/gi) || [];
  for (const b of doBlocks) {
    if (/DO\s+\$\$/i.test(b.slice(1))) {
      hits.push('nested-do-block');
      break;
    }
  }
  // detect FK added without NOT VALID
  const fkAddRe = /ALTER\s+TABLE\s+public\."([^"]+)"\s+ADD\s+CONSTRAINT\s+([^\s]+)\s+FOREIGN\s+KEY[\s\S]*?;/gi;
  let m2: RegExpExecArray | null;
  while ((m2 = fkAddRe.exec(content)) !== null) {
    const stmt = m2[0];
    if (!/NOT\s+VALID/i.test(stmt)) {
      hits.push('fk-add-not-valid');
      break;
    }
  }
  return hits;
}

function main() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('No migrations directory found; skipping linter.');
    process.exit(0);
  }

  const violations: Array<{ file: string; patterns: string[] }> = [];
  const dirs = fs.readdirSync(MIGRATIONS_DIR);
  for (const d of dirs) {
    const dirPath = path.join(MIGRATIONS_DIR, d);
    const sqlPath = path.join(dirPath, 'migration.sql');
    if (fs.existsSync(sqlPath)) {
      const hits = scanFile(sqlPath);
      if (hits.length) violations.push({ file: sqlPath, patterns: hits });
    }
  }

  if (violations.length) {
    console.error('Migration linter failed. Found unsafe patterns:');
    for (const v of violations) {
      console.error(`\nFile: ${v.file}`);
      console.error(`Patterns:`);
      for (const p of v.patterns) console.error(`  - ${p}`);
    }
    process.exit(1);
  }

  console.log('Migration linter passed. No unsafe patterns found.');
}

main();
