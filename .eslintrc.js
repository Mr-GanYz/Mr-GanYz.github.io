module.exports = {
  "root": true,
  "parserOptions": {
    "sourceType": "module"
  },
  "extends": "eslint:recommended",
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "no-cond-assign": ["error", "always"],
    "no-console": "off",
  }
}