"use strict"

const path = require("path");

module.exports = {
  entry: "./src/lib/index.ts",
  output: {
    libraryTarget: "var",
    library: "XmlCore",
    filename: "dist/xml-core.js"
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: "ts-loader", exclude: path.resolve(__dirname, "node_modules") }
    ]
  },
  node: {
    Buffer: false,
    crypto: false,
  },
  externals: {
    "crypto": "require('crypto');",
    "xmldom-alpha": "require('xmldom');",
    "xpath.js": "require('xpath.js');",
  }
}