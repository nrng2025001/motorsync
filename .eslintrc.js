module.exports = {
  extends: [
    '@react-native',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-vars': 'off',
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', '.expo/', 'dist/', 'web-build/'],
};