module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  settings: { react: { version: "detect" } },
  env: { browser: true, es2022: true, node: true, jest: true },
  ignorePatterns: ["styled-system/", "node_modules/", "coverage/", "dist/"],
  rules: {
    // The new JSX transform means React need not be in scope.
    "react/react-in-jsx-scope": "off",
    // Panda style props are spread through generic prop bags in several
    // primitives; prop-types is meaningless in a TypeScript codebase.
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
};
