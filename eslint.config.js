// eslint.config.js - ESLint Configuration
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'prefer-const': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
  ],
}