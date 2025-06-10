import tseslint from "typescript-eslint";
import globals from "globals";
import eslintPluginSecurity from "eslint-plugin-security";

export default tseslint.config(
  {
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  eslintPluginSecurity.configs.recommended
);
