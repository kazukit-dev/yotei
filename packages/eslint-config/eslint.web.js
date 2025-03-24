import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginTailwind from "eslint-plugin-tailwindcss";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";

import base from "./eslint.base.js";

export default tseslint.config(
  base,
  eslintPluginTailwind.configs["flat/recommended"],
  {
    ignores: ["node_modules", "build", ".env"],
  },
  {
    ...eslintPluginReact.configs.flat.recommended,
    ...eslintPluginReact.configs.flat["jsx-runtime"],
    plugins: {
      react: eslintPluginReact,
    },
    rules: {
      "react/prop-types": "off",
    },
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    ...eslintPluginJsxA11y.flatConfigs.recommended,
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
  },
  {
    ...eslintPluginReactHooks.configs["recommended-latest"],
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
  }
);
