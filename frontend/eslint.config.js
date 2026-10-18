import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
    { ignores: ["dist"] },
    js.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    reactHooks.configs.flat["recommended-latest"],
    reactRefresh.configs.vite,
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        settings: { react: { version: "19.0" } },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "react/prop-types": "off",
            "react/no-unescaped-entities": "off",
        },
    },
];
