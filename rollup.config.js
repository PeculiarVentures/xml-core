import ts from "rollup-plugin-ts";

const pkg = require("./package.json");

const banner = [].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies);

export default [
  // types
  {
    input,
    plugins: [
      ts({
        tsconfig: resolvedConfig => ({
          ...resolvedConfig,
          removeComments: false,
          declaration: true,
        })
      }),
    ],
    external,
    output: [
      {
        banner,
        file: pkg.main,
        format: "cjs",
      },
    ]
  },
  // bundles
  {
    input,
    plugins: [
      ts({
        tsconfig: resolvedConfig => ({
          ...resolvedConfig,
          removeComments: true,
          declaration: false,
        })
      }),
    ],
    external,
    output: [
      {
        banner,
        file: pkg.main,
        format: "cjs",
      },
      {
        banner,
        file: pkg.module,
        format: "es",
      }
    ]
  },
];