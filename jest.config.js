// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/app.js',
    '!src/utils/seedDatabase.js'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70
    }
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true
};
