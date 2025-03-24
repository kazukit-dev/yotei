import tseslint from "typescript-eslint";
import globals from "globals";
import eslintPluginSecurity from "eslint-plugin-security";

import base from "./eslint.base.js";

export default tseslint.config(
  base,
  {
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    ...eslintPluginSecurity.configs.recommended,
  },
  {
    ignores: ["node_modules", "dist", ".env", ".wrangler"],
  }
);
