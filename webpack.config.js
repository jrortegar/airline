const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode:'development',
    entry: path.join(__dirname, "src", "index.js"),
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        fallback: {
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("http-browserify"),
            "url": require.resolve("url/"),
            "os": require.resolve("os-browserify/browser"),
            "assert": require.resolve("assert/"),
            "path": require.resolve("path-browserify"),
            "buffer": require.resolve("buffer")
        },
        alias:{
            process: "process/browser"
        }
    },
    module: {
        rules: [
            {
                test: /\.?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "index.html"),
            
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({process: "process/browser"}),
        new webpack.ProvidePlugin({Buffer: ['buffer','Buffer']})
    ]
}