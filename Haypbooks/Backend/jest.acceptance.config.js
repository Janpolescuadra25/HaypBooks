const ACCEPTANCE_SCHEMA = 'acceptance_test';

function configureAcceptanceDatabase() {
  const rawUrl = process.env.ACCEPTANCE_DATABASE_URL || process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error(
      'Acceptance tests require ACCEPTANCE_DATABASE_URL (or DATABASE_URL) for a dedicated test database.',
    );
  }

  const databaseUrl = new URL(rawUrl);
  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''));
  if (!/(test|acceptance)/i.test(databaseName)) {
    throw new Error(
      'Refusing acceptance test lifecycle: database name must contain "test" or "acceptance".',
    );
  }

  databaseUrl.searchParams.set('schema', ACCEPTANCE_SCHEMA);
  process.env.DATABASE_URL = databaseUrl.toString();
  process.env.TEST_SCHEMA = ACCEPTANCE_SCHEMA;
}

configureAcceptanceDatabase();

module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/acceptance/**/*.acceptance-spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  globalSetup: '<rootDir>/test/acceptance-global-setup.ts',
  globalTeardown: '<rootDir>/test/acceptance-global-teardown.ts',
  testTimeout: 60000,
  maxWorkers: 1,
  verbose: true,
};
