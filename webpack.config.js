const fs = require('fs')
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.ts', // Update the entry point to src/index.ts
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/, // Add a rule to handle TypeScript files
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/, // Add a rule to handle HTML files
                use: 'html-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
        noParse: [/jest\.config\.js/],
    },
    resolve: {
        extensions: ['.ts', '.js'], // Add TypeScript file extension to resolve
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html', // Update the template path to src/index.html
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        hot: true,
        host: 'localhost',
        server: {
            type: 'https',
            options: {
                key: fs.readFileSync('./localhost-key.pem'),
                cert: fs.readFileSync('./localhost.pem'),
                },
        },
        port: 8080,
    },
};
