const { makeWebpackConfig } = require('webpack-simple');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = makeWebpackConfig({
  devServer: {
    host: '0.0.0.0',
  },
  plugins: [new HtmlWebpackPlugin({ template: 'index.template.html' })],
});

module.exports = config;
