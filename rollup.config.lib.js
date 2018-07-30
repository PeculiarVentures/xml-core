import typescript from "rollup-plugin-typescript";

let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);

let sourcemap = process.argv.some(item => item.toLowerCase() === "--dev");

export default {
    input: "src/index.ts",
    plugins: [
        typescript({ typescript: require("typescript") }),
    ],
    external: external,
    output: {
        file: pkg.module,
        format: "es",
        sourcemap,
        globals: {
            tslib: "tslib",
        },
    },
};