module.exports = {
  extends: 'helloitsjoe',
  env: {
    es2020: true,
  },
  rules: {
    indent: 'off',
    'react/jsx-curly-newline': 'off',
    'react/prop-types': 'off',
    semi: 'off',
    camelcase: 'off',
    'import/prefer-default-export': 'off',
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
