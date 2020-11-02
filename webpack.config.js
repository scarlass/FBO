const path = require("path");
const wpCallback = require('event-callback-webpack-plugin');
const wpHtml = require("html-webpack-plugin");
const {merge} = require("webpack-merge")
const {argv} = process

const all = merge(require("./build.comp"), require("./build.css"));

const fMode = argv.findIndex(i => i === "--mode");
let prod = false
if(fMode !== -1) {
  prod = argv[fMode + 1] === "production"
}


function copyMain() {
let files = [
  "./sw.js",
  "./src/index.html",
  "./assets"
]
}

module.exports = merge(all, {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  }
});