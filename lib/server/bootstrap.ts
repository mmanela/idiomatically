require('ignore-styles');
require('@babel/register')({
    ignore: [/(node_modules)/],
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
        'syntax-dynamic-import',
        'dynamic-import-node',
        'react-loadable/babel', 
    ]
});

require('./index');

process.on('SIGINT', () => { console.log("Adios!"); process.exit(); })