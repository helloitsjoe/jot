module.exports = {
  presets: [
    '@babel/react',
    '@babel/preset-typescript',
    ['@babel/env', { targets: { node: 'current' } }],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    // TODO: Make sure this doesn't bloat bundle
    '@babel/plugin-transform-runtime',
  ],
};
