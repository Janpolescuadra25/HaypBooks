const ACCEPTANCE_SCHEMA = 'acceptance_test';

function validatedDatabaseUrl(): URL {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DATABASE_URL was not configured for acceptance teardown.');
  }

  const databaseUrl = new URL(rawUrl);
  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''));
  if (!/(test|acceptance)/i.test(databaseName)) {
    throw new Error('Refusing schema teardown: the database is not explicitly test-marked.');
  }
  if (databaseUrl.searchParams.get('schema') !== ACCEPTANCE_SCHEMA) {
    throw new Error(`Refusing schema teardown: expected schema=${ACCEPTANCE_SCHEMA}.`);
  }
  if (process.env.TEST_SCHEMA !== ACCEPTANCE_SCHEMA) {
    throw new Error(`Refusing schema teardown: TEST_SCHEMA must equal ${ACCEPTANCE_SCHEMA}.`);
  }

  return databaseUrl;
}

export default async function acceptanceGlobalTeardown(): Promise<void> {
  const databaseUrl = validatedDatabaseUrl();
  databaseUrl.searchParams.delete('schema');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Client } = require('pg');
  const client = new Client({ connectionString: databaseUrl.toString() });

  console.log(`[Acceptance Global Teardown] Dropping isolated schema: ${ACCEPTANCE_SCHEMA}`);
  await client.connect();
  try {
    await client.query(`DROP SCHEMA IF EXISTS "${ACCEPTANCE_SCHEMA}" CASCADE`);
  } finally {
    await client.end();
  }
}
