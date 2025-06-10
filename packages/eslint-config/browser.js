import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      ...globals.browser,
    },
  },
});
