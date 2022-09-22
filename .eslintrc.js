module.exports = {
  extends: 'helloitsjoe',
  rules: {
    indent: 'off',
    'react/jsx-curly-newline': 'off',
    'react/prop-types': 'off',
    semi: 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        '': 'never',
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
};
