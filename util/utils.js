const fs = require("fs");
const path = require("path");


function copySw() {
  fs.readFile("./sw.js", { encoding: "utf8" }, function (err, data) {
    if (err) throw err;

    data = data
      .replace(/(\/dist\/style)/g, "/style")
      .replace(/(\/dist)/g, "/js");

    fs.writeFile("./dist/sw.js", data, function (err) {
      if (err) throw err;
    });
  });
};

function copyDir(src, dest) {
  let assets = fs.readdirSync(src);
  for (let k of assets) {

    
  }
};

exports.copyDir = copyDir;
exports.copySw = copySw;

// module.exports = exports;