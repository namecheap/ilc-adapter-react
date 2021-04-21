module.exports = {
    root: true,
    env: {
        browser: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'jest'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:jest/recommended'],
};
