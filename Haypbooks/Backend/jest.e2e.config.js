module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.e2e-spec.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleNameMapper: {
    '^bcrypt$': 'bcryptjs'
  },
  setupFiles: ['<rootDir>/test/e2e.setup.ts'],
  verbose: true,
}
