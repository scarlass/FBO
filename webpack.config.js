const path = require("path");
const fs = require("fs");
const wpCallback = require('webpack-compiler-plugin').WebpackCompilerPlugin
const wpHtml = require("html-webpack-plugin");
const {merge} = require("webpack-merge")
const { argv } = process;

const all = merge(require("./build.comp"), require("./build.css"));

const fMode = argv.findIndex(i => i === "--mode");
let prod = false
if(fMode !== -1) {
  prod = argv[fMode + 1] === "production"
}


function changeSW() {
  fs.readFile("./sw.js", { encoding: "utf8" }, function (err, data) {
    if (err) throw err;

    data = data
      .replace(/(\/dist\/style)/g, "/style")
      .replace(/(\/dist)/g, "/js");

    fs.writeFile("./dist/sw.js", data, function (err) {
      if (err) throw err;
    });
  });
}
function copyAsset() {
  fs.copyFile("./assets", "./dist/assets", function (err) {
    if (err) throw err;
  })
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
        compileEnd: function () {
          // fs.renameSync("file://" + path.join(__dirname, "sw.js"), "file://" + path.join(__dirname, "dist", "sw.js"));
          console.time("delete style.js");
          fs.unlinkSync("./dist/js/style.js");
          console.timeEnd("delete style.js");

          console.time("delete material.js");
          fs.unlinkSync("./dist/js/material.js");
          console.timeEnd("delete material.js");

          changeSW();
          copyAsset();
        }
      }
    })
  ] : null
});