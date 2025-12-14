module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.e2e-spec.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  verbose: true,
}
