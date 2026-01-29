const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  try {
    await c.connect();
    console.log('Applying subscription_owner_xor constraint...');
    await c.query(`ALTER TABLE public."Subscription" ADD CONSTRAINT subscription_owner_xor CHECK ( (("companyId" IS NOT NULL)::int + ("practiceId" IS NOT NULL)::int) = 1 );`);
    console.log('Constraint applied');
  } catch (e) {
    console.error('Failed to add constraint:', e.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();