module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'standard',
    'plugin:n/recommended',
    'plugin:promise/recommended',
    'plugin:sonarjs/recommended',
    'prettier',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['n', 'promise', 'sonarjs'],
  rules: {},
}
