const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  const checks = [
    { name: 'fk_customercredit_tenant', sql: `ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) NOT VALID` },
    { name: 'fk_customercredit_customer', sql: `ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_customer FOREIGN KEY ("customerId") REFERENCES public."Customer"("contactId") NOT VALID` },
    { name: 'fk_customercredit_company', sql: `ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_company FOREIGN KEY ("companyId") REFERENCES public."Company"(id) NOT VALID` },
    { name: 'fk_customercreditline_credit', sql: `ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_credit FOREIGN KEY ("customerCreditId") REFERENCES public."CustomerCredit"(id) NOT VALID` },
    { name: 'fk_customercreditline_company', sql: `ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_company FOREIGN KEY ("companyId") REFERENCES public."Company"(id) NOT VALID` },
    { name: 'fk_customercreditline_account', sql: `ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_account FOREIGN KEY ("accountId") REFERENCES public."Account"(id) NOT VALID` },
    { name: 'fk_customercreditline_tenant', sql: `ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) NOT VALID` },
  ];

  for (const c of checks) {
    const res = await client.query('SELECT 1 FROM pg_constraint WHERE conname = $1', [c.name]);
    if (res.rowCount === 0) {
      try {
        await client.query(c.sql);
        console.log(`Added constraint ${c.name}`);
      } catch (e) {
        console.error(`Failed to add ${c.name}:`, e.message);
      }
    } else {
      console.log(`Constraint ${c.name} already exists`);
    }
  }

  await client.end();
})().catch(e => { console.error(e); process.exit(1) });