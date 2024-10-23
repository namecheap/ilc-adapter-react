/**
 * @type {import('lint-staged').Config}
 */
module.exports = {
    '*': 'prettier --ignore-unknown --write',
    '*.{ts, tsx}': 'npm run lint -- --fix',
};
