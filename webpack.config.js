const path = require('path');
const { makeWebpackConfig } = require('webpack-simple');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = makeWebpackConfig({
  ts: true,
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    host: '0.0.0.0',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: 'index.template.html' })],
});

module.exports = config;
