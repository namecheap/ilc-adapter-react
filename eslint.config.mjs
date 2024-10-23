import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jest from 'eslint-plugin-jest';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:jest/recommended'),
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
            jest,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parser: tsParser,
        },
    },
];
