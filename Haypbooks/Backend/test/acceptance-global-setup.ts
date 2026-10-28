import { execFileSync } from 'child_process';

const ACCEPTANCE_SCHEMA = 'acceptance_test';

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

  const npxExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execFileSync(npxExecutable, ['prisma', 'migrate', 'deploy', '--schema=prisma/schema.prisma'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'inherit', 'inherit'],
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl.toString(),
      TEST_SCHEMA: ACCEPTANCE_SCHEMA,
    },
  });

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
