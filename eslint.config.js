// ESLint for Smoke Desk (client and server). ESLint also formats the TS/JS files: the
// @stylistic rules are fixed on save in VS Code (.vscode/settings.json), with `semi` off.
// Every other file (JSON, CSS, Markdown, HTML) is formatted by Prettier (.prettierrc.json).
import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['**/node_modules/', '**/dist/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    jsx: true,
    braceStyle: '1tbs',
    commaDangle: 'always-multiline',
    arrowParens: true,
  }),
  {
    rules: {
      '@stylistic/semi': 'off',
      // Conditional JSX keeps the usual `cond ? (<A />) : (<B />)` layout.
      '@stylistic/multiline-ternary': ['error', 'always-multiline', { ignoreJSX: true }],
      // Text and inline elements stay on one line ("Stock: <span>…</span>").
      '@stylistic/jsx-one-expression-per-line': 'off',
      // JSX passed as a prop (<Route element={…}>) needs no parentheses.
      '@stylistic/jsx-wrap-multilines': [
        'error',
        {
          declaration: 'parens-new-line',
          assignment: 'parens-new-line',
          return: 'parens-new-line',
          arrow: 'parens-new-line',
          condition: 'parens-new-line',
          logical: 'parens-new-line',
          prop: 'ignore',
        },
      ],
      // A leading underscore marks a parameter a signature needs (a callback that ignores its first one).
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.{js,ts}'],
    ignores: ['client/src/**'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['client/src/**/*.{ts,tsx}'],
    extends: [eslintReact.configs['recommended-typescript'], reactHooks.configs.flat['recommended-latest'], reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      '@eslint-react/exhaustive-deps': 'warn',
      // The lists of this project are keyed by hand; the rule is left to code review.
      '@eslint-react/no-array-index-key': 'off',
    },
  },
  {
    files: ['client/src/**/*.test.{ts,tsx}', 'client/src/test/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
