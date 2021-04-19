module.exports = {
  transform: {
    [`^.+\\.(js|ts|tsx)$`]: 'ts-jest'
  },
  moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '**/?(*.)+(spec|test).(js|ts|tsx)',
  ],
};
