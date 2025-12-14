#!/usr/bin/env node
/*
  Creates a fresh local DB (drop/create) and runs prisma migrations + smoke seeds
  Usage: node scripts/db/squash-validate.js [dbName]
*/
const { Client } = require('pg');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const DEFAULT_DB = (() => {
  const url = process.env.DATABASE_URL;
  if (!url) return 'haypbooks_squash_validate';
  try {
    const u = new URL(url);
    return `${u.pathname.replace('/', '')}_squash_validate`;
  } catch (e) {
    return 'haypbooks_squash_validate';
  }
})();

const dbName = process.argv[2] || DEFAULT_DB;

async function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set in .env');
    process.exit(1);
  }
  const u = new URL(url);
  const adminDb = 'postgres';
  const adminUrl = `postgresql://${u.username}:${u.password}@${u.hostname}:${u.port}/${adminDb}`;

  const client = new Client({ connectionString: adminUrl });
  await client.connect();
  try {
    console.log(`Dropping database if exists: ${dbName}`);
    await client.query(`DROP DATABASE IF EXISTS ${dbName};`);
    console.log(`Creating database: ${dbName} using TEMPLATE template0 to avoid inheriting schema`);
    await client.query(`CREATE DATABASE ${dbName} TEMPLATE template0;`);
  } finally {
    await client.end();
  }
  // After DB creation ensure pgcrypto extension exists for gen_random_uuid()
  const newClient = new Client({ connectionString: `postgresql://${u.username}:${u.password}@${u.hostname}:${u.port}/${dbName}` });
  await newClient.connect();
  try {
    console.log('Cleaning public schema to ensure a truly clean DB');
    try {
      await newClient.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    } catch (e) {
      console.warn('Could not clean public schema:', e.message);
    }
    console.log('Creating extension: pgcrypto (if missing)');
    await newClient.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  } catch (e) {
    console.warn('Could not create pgcrypto extension: ', e.message);
  } finally {
    await newClient.end();
  }
}

// Split SQL statements into standalone statements respecting quotes, dollars, and comments
function splitSqlStatements(s) {
  const statements = [];
  let start = 0;
  let i = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;
  let inDollar = false;
  let dollarTag = null;
  while (i < s.length) {
    const ch = s[i];
    if (!inSingleQuote && !inDoubleQuote && s[i] === '$') {
      const m = s.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (m) {
        if (inDollar && dollarTag === m[1]) {
          inDollar = false; dollarTag = null; i += m[0].length; continue;
        }
        if (!inDollar) { inDollar = true; dollarTag = m[1]; i += m[0].length; continue; }
      }
    }
    if (!inDollar && !inLineComment && !inBlockComment) {
      if (ch === "'") {
        if (inSingleQuote) { if (s[i + 1] === "'") { i += 1; } else { inSingleQuote = false; } } else { inSingleQuote = true; }
      } else if (ch === '"') {
        if (inDoubleQuote) { if (s[i + 1] === '"') { i += 1; } else { inDoubleQuote = false; } } else { inDoubleQuote = true; }
      }
    }
    if (!inSingleQuote && !inDoubleQuote && !inDollar) {
      if (!inLineComment && !inBlockComment && ch === '-' && s[i + 1] === '-') { inLineComment = true; i += 2; continue; }
      if (!inLineComment && !inBlockComment && ch === '/' && s[i + 1] === '*') { inBlockComment = true; i += 2; continue; }
    }
    if (inLineComment && (ch === '\n' || ch === '\r')) { inLineComment = false; }
    if (inBlockComment && ch === '*' && s[i + 1] === '/') { inBlockComment = false; i += 2; continue; }
    if (!inSingleQuote && !inDoubleQuote && !inDollar && !inLineComment && !inBlockComment && ch === ';') {
      statements.push(s.slice(start, i).trim()); start = i + 1;
    }
    i++;
  }
  const last = s.slice(start).trim(); if (last) statements.push(last);
  return statements;
}

async function runPreMigrationConvert(dbName) {
  // Try to run the convert_tenantid_to_uuid migration early to avoid type mismatches.
  let filePath = path.resolve(__dirname, '../../prisma/migrations/20251215020000_convert_tenantid_to_uuid/migration.sql');
  const fs = require('fs');
  // Fallback to migrations-preview if present (we often stage conversion in preview before landing)
  if (!fs.existsSync(filePath)) {
    const previewPath = path.resolve(__dirname, '../../prisma/migrations-preview/20251215020000_convert_tenantid_to_uuid/migration.sql');
    if (fs.existsSync(previewPath)) {
      filePath = previewPath;
      console.log('Found convert migration in migrations-preview; using that for pre-conversion.');
    } else {
      console.warn('convert_tenantid_to_uuid migration file not found; skipping pre-conversion.');
      return;
    }
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  const { Client } = require('pg');
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `/${dbName}`;
  const client = new Client({ connectionString: url.toString() });
  await client.connect();
  try {
    console.log('Running pre-migration convert_tenantid_to_uuid to align types.');
    // Try running the whole file first (handles DO $$ blocks and PL/pgSQL scripts)
    try {
      await client.query(sql);
    } catch (wholeErr) {
      console.warn('Whole-file pre-conversion failed; falling back to statement-by-statement execution:', wholeErr.message);
      const statements = splitSqlStatements(sql);
      for (const stmt of statements) {
        if (!stmt || stmt.trim() === '') continue;
        try {
          await client.query(stmt + ';');
        } catch (err) {
          console.warn('Pre-conversion statement failed (continuing):', err.message);
        }
      }
    }
    console.log('Pre-conversion SQL executed (if applicable).');
  } catch (e) {
    console.warn('Pre-conversion execution failed (this may be OK):', e.message);
  } finally {
    await client.end();
  }
}

function run(cmd, args, env) {
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: true,
  });
  if (res.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(res.status || 1);
  }
}

(async () => {
  try {
    await createDb();

    await runPreMigrationConvert(dbName);

    const url = new URL(process.env.DATABASE_URL);
    url.pathname = `/${dbName}`;
    const newDbUrl = url.toString();

    console.log('Applying migrations to fresh DB...');
    // Debug: list tables in the new DB before running migrations
    try {
      const { Client } = require('pg');
      const c = new Client({ connectionString: newDbUrl });
      await c.connect();
      try {
        const res = await c.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='public';");
        console.log('Tables in public schema before deploy:', res.rows.map(r => r.table_name));
      } finally {
        await c.end();
      }
    } catch (e) {
      console.warn('pg listing failed:', e.message);
    }
    // Temporarily replace prisma/migrations with only the squashed migration so we test the squashed baseline
    const fs = require('fs');
    // Look for migrations in multiple common places (top-level prisma and Backend/prisma)
    const candidateMigrationsDirs = [
      path.resolve(__dirname, '../../../prisma/migrations'),
      path.resolve(__dirname, '../../prisma/migrations')
    ];
    // Prefer Backend/prisma/migrations when present, else fall back to top-level prisma/migrations
    let migrationsDir;
    if (fs.existsSync(candidateMigrationsDirs[1])) migrationsDir = candidateMigrationsDirs[1];
    else if (fs.existsSync(candidateMigrationsDirs[0])) migrationsDir = candidateMigrationsDirs[0];
    else migrationsDir = candidateMigrationsDirs[0];
    console.log('Using migrations directory:', migrationsDir);
    const migrationsBackup = migrationsDir + '.backup_for_squash_validate';
    const squashedDirName = process.env.SQUASH_DIR || '20251213202646_squashed';
    // Look for squashed migration in chosen migrations dir and also check Backend/prisma explicitly
    let squashedSrc = path.resolve(migrationsDir, squashedDirName);
    const alt = path.resolve(__dirname, '../../prisma/migrations', squashedDirName);
    if (!fs.existsSync(squashedSrc) && fs.existsSync(alt)) {
      squashedSrc = alt;
    }
    console.log('Looking for squashed migration at (primary then alt):', squashedSrc, alt);
    let restored = false;
    try {
      if (fs.existsSync(migrationsDir)) {
        console.log('Backing up existing migrations...');
        fs.renameSync(migrationsDir, migrationsBackup);
      }
      console.log('Creating temporary migrations folder with squashed baseline...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      // Copy squashed migration directory from backup location (if exists there) or from repo
        console.log('Looking for squashed migration at:', squashedSrc);
        // If migrationsDir was just moved to a backup, the squashed migration may now live under the backup
        if (!fs.existsSync(squashedSrc)) {
          const backupSrc = path.resolve(migrationsBackup, squashedDirName);
          if (fs.existsSync(backupSrc)) {
            console.log('Found squashed migration inside migrations backup; using that source.');
            squashedSrc = backupSrc;
          }
        }
        if (fs.existsSync(squashedSrc)) {
        const dest = path.resolve(migrationsDir, squashedDirName);
        // Simple directory copy
          console.log('Copying squashed migration to temp migrations dir...');
        function copyDir(src, dst) {
          fs.mkdirSync(dst, { recursive: true });
          for (const name of fs.readdirSync(src)) {
            const s = path.join(src, name);
            const d = path.join(dst, name);
            const stat = fs.statSync(s);
            if (stat.isDirectory()) copyDir(s, d);
            else fs.copyFileSync(s, d);
          }
        }
        copyDir(squashedSrc, dest);
        // Post-process the migration to add idempotency guards for robust deploys
        try {
          if (process.env.SQUASH_GUARD === '1') {
            console.log('Applying idempotency guards to squashed migration (SQUASH_GUARD=1)');
            const guardScript = path.resolve(__dirname, 'guard-squashed-migration.js');
            if (fs.existsSync(guardScript)) {
              const child = require('child_process').spawnSync('node', [guardScript, path.join(dest, 'migration.sql')], { stdio: 'inherit' });
              if (child.status !== 0) console.warn('guard-squashed-migration.js failed (continuing)');
            }
          } else {
            console.log('SQUASH_GUARD not enabled; skipping idempotency guard script.');
          }
        } catch (e) {
          console.warn('guard script failed:', e.message);
        }
          console.log('Copy complete.');
      } else {
        console.warn('Squashed migration directory not found; proceeding with existing migrations.');
      }

        console.log('Temporary migrations folder contents:', fs.readdirSync(migrationsDir));
        // Ensure Prisma schema path is provided when project prisma is not at repo root
        const candidateSchemaPaths = [
          path.resolve(__dirname, '../../../prisma/schema.prisma'),
          path.resolve(__dirname, '../../prisma/schema.prisma')
        ];
        const schemaPath = candidateSchemaPaths.find(p => fs.existsSync(p));
        // Try to respect the project's pinned prisma version (package.json) to avoid npx pulling Prisma v7
        let prismaPkgVersion = null;
        try {
          const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));
          if (pkg && pkg.dependencies && pkg.dependencies.prisma) prismaPkgVersion = pkg.dependencies.prisma.replace(/^[^0-9]*/, '');
        } catch (e) {
          // ignore
        }
        const prismaBin = prismaPkgVersion ? `prisma@${prismaPkgVersion}` : 'prisma';
        const prismaArgs = [prismaBin, 'migrate', 'deploy'];
        if (schemaPath) prismaArgs.push('--schema', schemaPath);
        run('npx', prismaArgs, { DATABASE_URL: newDbUrl });
      restored = true;
    } finally {
      try {
        if (fs.existsSync(migrationsBackup)) {
          // remove the temp migrations and restore backup
          console.log('Restoring original migrations...');
          const rimraf = (p) => { if (fs.existsSync(p)) { for (const f of fs.readdirSync(p)) { const fp = path.join(p,f); const st = fs.statSync(fp); if (st.isDirectory()) rimraf(fp); else fs.unlinkSync(fp); } fs.rmdirSync(p); } };
          rimraf(migrationsDir);
          fs.renameSync(migrationsBackup, migrationsDir);
        }
      } catch (e) {
        console.warn('Failed to restore migrations backup:', e.message);
      }
      if (!restored) process.exit(1);
    }

    console.log('Generating Prisma client...');
      // Use pinned prisma version and schema path when generating client
      try {
        const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));
        const prismaPkgVersion = pkg && pkg.dependencies && pkg.dependencies.prisma ? pkg.dependencies.prisma.replace(/^[^0-9]*/, '') : null;
        const prismaBin = prismaPkgVersion ? `prisma@${prismaPkgVersion}` : 'prisma';
        const candidateSchemaPaths = [
          path.resolve(__dirname, '../../../prisma/schema.prisma'),
          path.resolve(__dirname, '../../prisma/schema.prisma')
        ];
        const schemaPath = candidateSchemaPaths.find(p => fs.existsSync(p));
        const genArgs = [prismaBin, 'generate'];
        if (schemaPath) genArgs.push('--schema', schemaPath);
        run('npx', genArgs, { DATABASE_URL: newDbUrl });
      } catch (e) {
        console.warn('Prisma generate fallback (no pinned version or schema detection failed):', e.message);
        run('npx', ['prisma', 'generate'], { DATABASE_URL: newDbUrl });
      }

    console.log('Running smoke seeds...');
    // Run seeds using the Backend package (ensure npm finds package.json)
    const backendDir = path.resolve(__dirname, '../../');
    run('npm', ['--prefix', backendDir, 'run', 'db:seed:smoke'], { DATABASE_URL: newDbUrl });

    console.log('Validation completed successfully.');
  } catch (err) {
    console.error('Validation failed:', err);
    process.exit(1);
  }
})();
