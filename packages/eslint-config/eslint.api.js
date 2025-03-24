import tseslint from "typescript-eslint";
import base from "./eslint.base.js";
import globals from "globals";
import security from "eslint-plugin-security";

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
    ...security.configs.recommended,
  },
  {
    ignores: ["node_modules", "dist", ".env", ".wrangler"],
  }
);
