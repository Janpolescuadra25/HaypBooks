module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.unit-spec.ts',
    '**/test/**/*.spec.ts',
    '**/test/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.spec.ts',
    '<rootDir>/src/__tests__/shared/gl-integration-period-lock.spec.ts',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  verbose: true,
}
