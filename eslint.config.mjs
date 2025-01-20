import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        files: ['**/*.{ts,js}'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
                ecmaVersion: 2022
            }
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
];
