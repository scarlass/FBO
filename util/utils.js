const fs = require("fs");
const fse = require("fs-extra")
const path = require("path");
const prcPath = process.cwd();


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

  let srcDir = path.join(prcPath, src);
  let destDir = path.join(prcPath, dest);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fse.copy(srcDir, destDir, function (err) {
    if (err) throw err;
  })
};

/** @param {string[]} paths */
function deleteFiles(...paths) {
  for (let k of paths) {
    fs.unlinkSync(path.join(prcPath, k));
  }
}

exports.copyDir = copyDir;
exports.copySw = copySw;
exports.deleteFiles = deleteFiles;

// module.exports = exports;