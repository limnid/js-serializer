const path = require('path');

module.exports = {
    entry: './src/marshmallow.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};