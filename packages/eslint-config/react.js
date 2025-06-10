import tseslint from "typescript-eslint";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginTailwind from "eslint-plugin-tailwindcss";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ...eslintPluginReact.configs.flat.recommended,
    ...eslintPluginReact.configs.flat["jsx-runtime"],
    rules: {
      "react/prop-types": "off",
    },
  },
  eslintPluginJsxA11y.flatConfigs.recommended,
  eslintPluginReactHooks.configs["recommended-latest"],
  eslintPluginTailwind.configs["flat/recommended"]
);
