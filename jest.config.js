module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^views/(.*)$': '<rootDir>/src/views/$1',
    '^store/(.*)$': '<rootDir>/src/store/$1',
    '^constants/(.*)$': '<rootDir>/src/constants/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};
