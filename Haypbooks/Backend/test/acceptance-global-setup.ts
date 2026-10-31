import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const ACCEPTANCE_SCHEMA = 'acceptance_test';
const ACCEPTANCE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalPlaces: 0 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimalPlaces: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2 },
] as const;

function validatedDatabaseUrl(): URL {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DATABASE_URL was not configured for the acceptance test process.');
  }

  const databaseUrl = new URL(rawUrl);
  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''));
  if (!/(test|acceptance)/i.test(databaseName)) {
    throw new Error('Refusing schema setup: the database is not explicitly test-marked.');
  }
  if (databaseUrl.searchParams.get('schema') !== ACCEPTANCE_SCHEMA) {
    throw new Error(`Refusing schema setup: expected schema=${ACCEPTANCE_SCHEMA}.`);
  }
  if (process.env.TEST_SCHEMA !== ACCEPTANCE_SCHEMA) {
    throw new Error(`Refusing schema setup: TEST_SCHEMA must equal ${ACCEPTANCE_SCHEMA}.`);
  }

  return databaseUrl;
}

export default async function acceptanceGlobalSetup(): Promise<void> {
  const databaseUrl = validatedDatabaseUrl();
  const adminUrl = new URL(databaseUrl.toString());
  adminUrl.searchParams.delete('schema');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Client } = require('pg');
  const client = new Client({ connectionString: adminUrl.toString() });

  console.log(`[Acceptance Global Setup] Recreating isolated schema: ${ACCEPTANCE_SCHEMA}`);
  await client.connect();
  try {
    await client.query(`DROP SCHEMA IF EXISTS "${ACCEPTANCE_SCHEMA}" CASCADE`);
    await client.query(`CREATE SCHEMA "${ACCEPTANCE_SCHEMA}"`);
  } finally {
    await client.end();
  }

  execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', {
    cwd: process.cwd(),
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : '/bin/sh',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl.toString(),
      TEST_SCHEMA: ACCEPTANCE_SCHEMA,
    },
  });

  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl.toString() },
    },
  });
  try {
    for (const currency of ACCEPTANCE_CURRENCIES) {
      await prisma.currency.upsert({
        where: { code: currency.code },
        update: {
          name: currency.name,
          symbol: currency.symbol,
          decimalPlaces: currency.decimalPlaces,
          isActive: true,
        },
        create: {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
          decimalPlaces: currency.decimalPlaces,
          isActive: true,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }

  const verificationClient = new Client({ connectionString: adminUrl.toString() });
  await verificationClient.connect();
  try {
    const result = await verificationClient.query(
      `SELECT to_regclass($1) AS users_table, to_regclass($2) AS migrations_table`,
      [`"${ACCEPTANCE_SCHEMA}"."User"`, `"${ACCEPTANCE_SCHEMA}"."_prisma_migrations"`],
    );
    if (!result.rows[0]?.users_table || !result.rows[0]?.migrations_table) {
      throw new Error('Acceptance schema migration verification failed.');
    }
  } finally {
    await verificationClient.end();
  }
}
