const { Client } = require('pg');
(async ()=>{
  const c = new Client({ connectionString: process.argv[2] });
  await c.connect();
  const r = await c.query("SELECT count(*)::int as bad FROM public.\"Tenant\" WHERE id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'");
  console.log('Tenant ids non-UUID count:', r.rows[0].bad);
  if (r.rows[0].bad > 0) {
    const s = await c.query("SELECT id FROM public.\"Tenant\" WHERE id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' LIMIT 20");
    console.log('Sample bad ids:', s.rows.map(r=>r.id));
  } else {
    console.log('All Tenant.id values look UUID-formatted');
  }
  await c.end();
})();
