import typescript from "rollup-plugin-typescript";
import babel from "rollup-plugin-babel";
import babelrc from "babelrc-rollup";

let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);

let sourceMap = process.argv.some(item => item.toLowerCase() === "--dev");

export default {
    entry: "src/index.ts",
    plugins: [
        typescript({ typescript: require("typescript") }),
        babel(babelrc()),
    ],
    external: external,
    targets: [
        {
            dest: pkg.main,
            format: "umd",
            moduleName: "XmlCore",
            sourceMap
        },
        {
            dest: pkg.module,
            format: "es",
            sourceMap
        }
    ]
};