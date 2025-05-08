import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import { fixupConfigRules } from "@eslint/compat";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    globalIgnores(["node_modules/*", ".next/*", ".out/*", "!**/.prettierrc.js"]),
    {
        extends: compat.extends("eslint:recommended"),

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },

            ecmaVersion: 2020,
            sourceType: "module",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],

        extends: fixupConfigRules(compat.extends(
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:react/recommended",
            "plugin:react-hooks/recommended",
            "plugin:prettier/recommended",
        )),

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            parser: tsParser,
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "no-case-declarations": "off",
            "react/prop-types": "off",
            "react/react-in-jsx-scope": "off",

            "react/self-closing-comp": ["error", {
                component: true,
                html: true,
            }],

            "react/button-has-type": ["error", {
                button: true,
                submit: true,
                reset: true,
            }],

            "react/function-component-definition": ["error", {
                namedComponents: "arrow-function",
                unnamedComponents: "arrow-function",
            }],

            "react/no-danger": "off",

            "react/jsx-wrap-multilines": ["error", {
                declaration: "parens-new-line",
                assignment: "parens-new-line",
                return: "parens-new-line",
                arrow: "parens-new-line",
                condition: "parens-new-line",
                logical: "parens-new-line",
            }],

            "react/jsx-tag-spacing": ["error", {
                closingSlash: "never",
                beforeSelfClosing: "always",
                afterOpening: "never",
                beforeClosing: "allow",
            }],

            "react/jsx-props-no-multi-spaces": ["error"],
            "react/jsx-no-useless-fragment": ["error"],
            "react/jsx-fragments": ["error"],
            "@typescript-eslint/no-unused-vars": ["error"],
            "@typescript-eslint/no-explicit-any": "off",

            "@typescript-eslint/explicit-function-return-type": ["error", {
                allowExpressions: true,
                allowConciseArrowFunctionExpressionsStartingWithVoid: true,
            }],

            "prettier/prettier": ["warn", {
                endOfLine: "auto",
            }, {
                usePrettierrc: true,
            }],
        },
    },
]);