const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' });
  await c.connect();
  const stmts = [
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "businessType" text`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "industry" text`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "address" text`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "taxId" varchar(50)`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "logoUrl" text`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "invoicePrefix" text`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "vatRegistered" boolean DEFAULT false`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "vatRate" numeric(5,2)`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "pricesInclusive" boolean DEFAULT false`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "defaultPaymentTerms" text`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "accountingMethod" text DEFAULT 'ACCRUAL'`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "inventoryEnabled" boolean DEFAULT false`,
    `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "payrollEnabled" boolean DEFAULT false`
  ];
  for (const s of stmts) {
    try {
      console.log('Executing:', s.slice(0,80) + '...');
      await c.query(s);
    } catch (e) {
      console.error('Failed to execute statement:', e.message || e);
    }
  }
  await c.end();
  console.log('Done.');
})();
