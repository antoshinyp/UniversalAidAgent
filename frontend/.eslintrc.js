module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'prettier'],
  rules: {
    // Syntax error prevention
    'no-template-curly-in-string': 'error',
    'no-unexpected-multiline': 'error',
    'no-unreachable': 'error',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'prettier/prettier': 'warn',

    // Backtick and quotes consistency
    'quotes': ['warn', 'double', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'template-curly-spacing': ['error', 'never'],
    
    // React specific rules
    'react/prop-types': 'off', // Disable prop-types as you may be using TypeScript
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Accessibility
    'jsx-a11y/anchor-is-valid': 'warn'
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};