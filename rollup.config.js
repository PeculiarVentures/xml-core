import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

const banner = [].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies);

export default {
  input,
  plugins: [
    typescript({
      check: true,
      clean: true,
      tsconfigOverride: {
        compilerOptions: {
          removeComments: true,
          module: "ES2015",
        }
      }
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
    },
  ],
};