import typescript from "rollup-plugin-typescript";

let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);

const sourcemap = process.argv.some(item => item.toLowerCase() === "--dev");

export default {
    input: "src/index.ts",
    plugins: [
        typescript({ typescript: require("typescript"), module: "es2015", target: "es5" }),
    ],
    external: external,
    output: {
        file: pkg.main,
        format: "umd",
        name: "XmlCore",
        sourcemap
    }
};