import typescript from "rollup-plugin-typescript";

let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);

const sourcemap = process.argv.some(item => item.toLowerCase() === "--dev");

export default {
    input: "src/index.ts",
    plugins: [
        typescript({ typescript: require("typescript") }),
    ],
    external: external,
    output: {
        file: pkg.main,
        format: "es",
        name: "XmlCore",
        sourcemap,
        globals: {
            tslib: "tslib",
        },
    },
};