import base from "@yotei/eslint-config/base";
import node from "@yotei/eslint-config/node";

export default [
  {
    ignores: [".wrangler"],
  },
  ...base,
  ...node,
];
