module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/.*print.*\\.test\\.(ts|tsx)$'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          // Override for tests so JSX compiles and modules work in Jest
          jsx: 'react-jsx',
          module: 'commonjs',
          target: 'ES2020',
        },
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
