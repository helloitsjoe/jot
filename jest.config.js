const { makeJestConfig } = require('jest-simple-config');

const config = makeJestConfig({
  testEnvironment: 'jsdom',
  collectCoverage: false,
  roots: ['<rootDir>/src'],
});

module.exports = config;
