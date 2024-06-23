const { makeJestConfig } = require('jest-simple-config');

const config = makeJestConfig({
  testEnvironment: 'jsdom',
  collectCoverage: false,
  setupFiles: ['./jest.polyfills.js'],
  roots: ['<rootDir>/src'],
});

module.exports = config;
