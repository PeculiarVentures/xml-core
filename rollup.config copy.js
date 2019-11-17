import typescript from "rollup-plugin-typescript2";

const pkg = require("./package.json");

const banner = [].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies);

export default [
  {
    input,
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            removeComments: true,
            declaration: false,
          },
        },
        include: ["src/**/*.*"]
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
  // types
  {
    input,
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            removeComments: false,
            declaration: true
          }
        }
      }),
    ],
    external,
    output: [
      {
        banner,
        file: pkg.types,
        format: "es",
      }
    ]
  },
];