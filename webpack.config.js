const { makeWebpackConfig } = require('webpack-simple');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = makeWebpackConfig({
  devServer: {
    host: '0.0.0.0',
  },
  plugins: [new HtmlWebpackPlugin({ template: 'index.template.html' })],
});

module.exports = config;

// module.exports = {
//   ...config,
//   entry: './src/index.tsx',
//   output: {
//     filename: './public/index.js',
//   },
//   devtool: 'source-map',
//   resolve: {
//     extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
//   },
//   module: {
//     ...config.module,
//     rules: [
//       ...config.module.rules,
//       { test: /\.tsx?$/, loader: 'ts-loader' },
//       { test: /\.js$/, loader: 'source-map-loader' },
//     ],
//   },
// };
