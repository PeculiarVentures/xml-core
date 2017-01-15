import typescript from "rollup-plugin-typescript";

let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);

let sourceMap = process.argv.some(item => item.toLowerCase() === "--dev");

export default {
    entry: "src/index.ts",
    plugins: [
        typescript({ typescript: require("typescript") }),
    ],
    external: external,
    targets: [
        {
            dest: pkg.module,
            format: "es",
            sourceMap
        }
    ]
};