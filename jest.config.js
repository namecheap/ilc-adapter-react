module.exports = {
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    testEnvironment: 'jsdom',
};
