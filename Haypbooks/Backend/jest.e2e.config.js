module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.e2e-spec.ts', '**/test/**/*.e2e-spec.js'],
  globals: {
    'ts-jest': { tsconfig: 'tsconfig.json' }
  },
  moduleNameMapper: { '^bcrypt$': 'bcryptjs' },
  setupFiles: ['<rootDir>/test/e2e.setup.ts'],
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  verbose: true
}