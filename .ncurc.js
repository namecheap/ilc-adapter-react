/** @type {import("npm-check-updates").RunOptions} */
module.exports = {
    loglevel: 'error',
    dep: ['dev', 'optional', 'peer', 'prod'],
    reject: [
        'react', // currently blocked
        'react-dom',
        '@types/react',
        '@types/react-dom',
    ],
};
