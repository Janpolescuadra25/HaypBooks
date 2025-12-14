#!/usr/bin/env node
/* Run migration SQL file statements one-by-one to pinpoint failing statement */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node run-migration-debug.js <migration.sql>');
  process.exit(1);
}

const sql = fs.readFileSync(migrationFile, 'utf8');
// Robust split: split on semicolons that are not inside dollar-quoted ($$) or single/double quotes
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
    // Detect dollar-quote start/end
    if (!inSingleQuote && !inDoubleQuote && s[i] === '$') {
      // find tag
      const m = s.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (m) {
        if (inDollar && dollarTag === m[1]) {
          inDollar = false;
          dollarTag = null;
          i += m[0].length;
          continue;
        }
        if (!inDollar) {
          inDollar = true;
          dollarTag = m[1];
          i += m[0].length;
          continue;
        }
      }
    }
    if (!inDollar && !inLineComment && !inBlockComment) {
      if (ch === "'") {
        if (inSingleQuote) {
          if (s[i + 1] === "'") {
            i += 1; // escaped single quote, skip next char
          } else {
            inSingleQuote = false; // closing quote
          }
        } else {
          inSingleQuote = true; // opening quote
        }
      } else if (ch === '"') {
        if (inDoubleQuote) {
          if (s[i + 1] === '"') {
            i += 1; // escaped double quote
          } else {
            inDoubleQuote = false; // closing double quote
          }
        } else {
          inDoubleQuote = true; // opening double quote
        }
      }
    }
    // Handle comments
    if (!inSingleQuote && !inDoubleQuote && !inDollar) {
      if (!inLineComment && !inBlockComment && ch === '-' && s[i + 1] === '-') {
        inLineComment = true;
        i += 2;
        continue;
      }
      if (!inLineComment && !inBlockComment && ch === '/' && s[i + 1] === '*') {
        inBlockComment = true;
        i += 2;
        continue;
      }
    }
    if (inLineComment && (ch === '\n' || ch === '\r')) {
      inLineComment = false;
    }
    if (inBlockComment && ch === '*' && s[i + 1] === '/') {
      inBlockComment = false;
      i += 2;
      continue;
    }
    if (!inSingleQuote && !inDoubleQuote && !inDollar && !inLineComment && !inBlockComment && ch === ';') {
      statements.push(s.slice(start, i).trim());
      start = i + 1;
    }
    i++;
  }
  const last = s.slice(start).trim();
  if (last) statements.push(last);
  return statements;
}

const statements = splitSqlStatements(sql);

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL missing'); process.exit(1); }
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    let i = 0;
    for (const stmt of statements) {
      i++;
      const trimmed = stmt.trim();
      if (!trimmed) continue;
      try {
        console.log(`Running statement ${i}...`);
        await client.query(trimmed + ';');
      } catch (e) {
        console.error(`Statement ${i} failed:`, e.message);
        console.error('Statement text:', trimmed);
        break;
      }
    }
  } finally {
    await client.end();
  }
}

run().catch(e => { console.error(e); process.exit(1); });
