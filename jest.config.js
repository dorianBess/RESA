module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '@modules/(.*)': '<rootDir>/modules/$1',
    '@shared/(.*)': '<rootDir>/shared/$1',
    '@config/(.*)': '<rootDir>/config/$1',
  },
  collectCoverageFrom: [
    '**/application/use-cases/**/*.ts',
    '**/infrastructure/guards/**/*.ts',
    '!**/*.spec.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
