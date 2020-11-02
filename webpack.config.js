const path = require("path");
const fs = require("fs");
const wpCallback = require('webpack-compiler-plugin').WebpackCompilerPlugin
const wpHtml = require("html-webpack-plugin");
const {merge} = require("webpack-merge")
const { argv } = process;

const all = merge(require("./util/build.comp"), require("./util/build.css"));

const fMode = argv.findIndex(i => i === "--mode");
let prod = false
if(fMode !== -1) {
  prod = argv[fMode + 1] === "production"
}

module.exports = merge(all, {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].js"
  },
  plugins: prod ? [
    new wpHtml({
      minify: false,
      template: "./src/index.html",
      inject: false
    }),
    new wpCallback({
      name: "wp-event",
      listeners: {
        buildStart: function () {
          let u = require("./util/utils");
          // copyAsset();
          u.copySw();
          u.copyDir("./assets");
        },
        compileEnd: function () {
          // fs.renameSync("file://" + path.join(__dirname, "sw.js"), "file://" + path.join(__dirname, "dist", "sw.js"));
          console.time("delete style.js");
          fs.unlinkSync("./dist/js/style.js");
          console.timeEnd("delete style.js");

          console.time("delete material.js");
          fs.unlinkSync("./dist/js/material.js");
          console.timeEnd("delete material.js");

        }
      }
    })
  ] : null
});