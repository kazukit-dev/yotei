import base from "@yotei/eslint-config/base";
import browser from "@yotei/eslint-config/browser";
import react from "@yotei/eslint-config/react";

export default [
  { ignores: [".react-router", "build"] },
  ...base,
  ...browser,
  ...react,
];
