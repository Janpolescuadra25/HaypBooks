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

  console.log(`[Acceptance Global Teardown] Performing sequential cleanup for: ${ACCEPTANCE_SCHEMA}`);
  await client.connect();
  try {
    const schemaCheck = await client.query(
      'SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1',
      [ACCEPTANCE_SCHEMA],
    );

    if (schemaCheck.rows.length === 0) {
      console.warn('Acceptance schema already removed, skipping teardown.');
      return;
    }

    const tablesResult = await client.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = \'BASE TABLE\'',
      [ACCEPTANCE_SCHEMA],
    );

    for (const row of tablesResult.rows) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${ACCEPTANCE_SCHEMA}"."${row.table_name}" CASCADE`);
      } catch {
        // Sequential cleanup continues even when an individual table cannot be dropped.
      }
    }

    const viewsResult = await client.query(
      'SELECT table_name FROM information_schema.views WHERE table_schema = $1',
      [ACCEPTANCE_SCHEMA],
    );

    for (const row of viewsResult.rows) {
      try {
        await client.query(`DROP VIEW IF EXISTS "${ACCEPTANCE_SCHEMA}"."${row.table_name}" CASCADE`);
      } catch {
        // Sequential cleanup continues even when an individual view cannot be dropped.
      }
    }

    const enumsResult = await client.query(
      `SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = $1 AND t.typtype = 'e'`,
      [ACCEPTANCE_SCHEMA],
    );

    for (const row of enumsResult.rows) {
      try {
        await client.query(`DROP TYPE IF EXISTS "${ACCEPTANCE_SCHEMA}"."${row.typname}" CASCADE`);
      } catch {
        // Sequential cleanup continues even when an individual enum cannot be dropped.
      }
    }

    await client.query(`DROP SCHEMA IF EXISTS "${ACCEPTANCE_SCHEMA}" CASCADE`);
    console.log('Successfully completed sequential teardown of acceptance test schema.');
  } finally {
    await client.end();
  }
}
