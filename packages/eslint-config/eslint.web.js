import react from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";
import tailwind from "eslint-plugin-tailwindcss";
import a11y from "eslint-plugin-jsx-a11y";

import base from "./eslint.base.js";

export default tseslint.config(
  base,
  tailwind.configs["flat/recommended"],
  {
    ignores: ["node_modules", "build", ".env"],
  },
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"],
    rules: {
      [react.rules["prop-types"]]: "off",
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
    ...a11y.flatConfigs.recommended,
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
  }
);
