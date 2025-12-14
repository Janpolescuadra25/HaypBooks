const base = require('./jest.config.js')

module.exports = {
  ...base,
  testMatch: ['<rootDir>/src/__tests__/search-ui.test.tsx'],
  // Use a lightweight setup to avoid heavy polyfills during this focused run
  setupFilesAfterEnv: ['<rootDir>/jest.search.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          target: 'ES2020',
        },
        diagnostics: false,
        isolatedModules: true,
      },
    ],
  },
}
