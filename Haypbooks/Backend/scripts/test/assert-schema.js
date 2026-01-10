const { Client } = require('pg');

const required = {
  Company: {
    businessType: 'text',
    vatRegistered: 'boolean',
    vatRate: 'numeric',
    pricesInclusive: 'boolean',
    defaultPaymentTerms: 'text',
    accountingMethod: 'text',
  }
}

async function run() {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' });
  try {
    await c.connect();
    for (const [table, cols] of Object.entries(required)) {
      const q = `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`;
      const res = await c.query(q, [table]);
      if (res.rows.length === 0) {
        throw new Error(`Table ${table} does not exist or has no columns`);
      }
      const existing = Object.fromEntries(res.rows.map(r => [r.column_name, r.data_type]));
      const missing = [];
      const mismatched = [];
      for (const [col, expectedType] of Object.entries(cols)) {
        if (!Object.prototype.hasOwnProperty.call(existing, col)) {
          missing.push(col);
        } else {
          const actual = existing[col];
          // for numeric types allow 'numeric' or 'numeric'
          const ok = expectedType === actual || (expectedType === 'numeric' && actual === 'numeric');
          if (!ok) mismatched.push({ col, expectedType, actual });
        }
      }
      if (missing.length || mismatched.length) {
        const parts = [];
        if (missing.length) parts.push(`missing columns: ${missing.join(', ')}`);
        if (mismatched.length) parts.push('mismatches: ' + mismatched.map(m => `${m.col} expected=${m.expectedType} actual=${m.actual}`).join('; '));
        throw new Error(`${table} schema assertion failed: ${parts.join(' | ')}`);
      }
    }
    console.log('Schema assertions: OK')
    await c.end();
    process.exit(0);
  } catch (e) {
    console.error('Schema assertion failed:', e && e.message ? e.message : e);
    try { await c.end(); } catch (_) {}
    process.exit(2);
  }
}

run();
