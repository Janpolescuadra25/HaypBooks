module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.unit-spec.ts', '**/test/**/*.spec.ts', '**/test/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  verbose: true,
}
