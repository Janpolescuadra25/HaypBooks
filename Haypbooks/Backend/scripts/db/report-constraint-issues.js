const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test' });
  await c.connect();

  // Get FK constraints that are NOT VALID or exist
  const fkRes = await c.query(`
    SELECT
      con.oid,
      con.conname,
      con.convalidated,
      con.conrelid::regclass::text as table_name,
      con.confrelid::regclass::text as referenced_table,
      arr.pos as ord,
      arr.conkey,
      arr.confkey
    FROM pg_constraint con
    CROSS JOIN LATERAL (
      SELECT unnest(con.conkey) as conkey, unnest(con.confkey) as confkey, generate_series(1, array_length(con.conkey, 1)) as pos
    ) arr
    WHERE con.contype = 'f'
    ORDER BY con.convalidated, con.conname, arr.pos
  `);

  const issues = [];

  for (const row of fkRes.rows) {
    const { oid, conname, convalidated, table_name, referenced_table, conkey, confkey } = row;
    // find column names & types
    const colRes = await c.query(`
      SELECT a.attname as colname, format_type(a.atttypid, a.atttypmod) as data_type, t.typname as udt_name
      FROM pg_attribute a
      JOIN pg_type t ON a.atttypid = t.oid
      WHERE a.attrelid = ($1)::regclass
        AND a.attnum = $2
    `, [table_name, conkey]);

    const refColRes = await c.query(`
      SELECT a.attname as colname, format_type(a.atttypid, a.atttypmod) as data_type, t.typname as udt_name
      FROM pg_attribute a
      JOIN pg_type t ON a.atttypid = t.oid
      WHERE a.attrelid = ($1)::regclass
        AND a.attnum = $2
    `, [referenced_table, confkey]);

    const left = colRes.rows[0] || { colname: 'unknown', udt_name: null };
    const right = refColRes.rows[0] || { colname: 'unknown', udt_name: null };

    const typeMismatch = left.udt_name && right.udt_name && left.udt_name !== right.udt_name;
    issues.push({ conname, table_name, referenced_table, convalidated, left, right, typeMismatch });
  }

  console.log(JSON.stringify(issues, null, 2));
  await c.end();
})();
