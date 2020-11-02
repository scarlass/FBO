const ExtractCss = require("extract-css-chunks-webpack-plugin");

function recursiveIssuer(m) {
  if(m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if(m.name) {
    return m.name;
  } else {
    return false;
  }
}


/** @type {import("webpack").Configuration} */
const config = {
  entry: {
    style: "./src/style/style.scss",
    material: "./src/style/material.scss"
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        style: {
          name: "style",
          test: function(e, r, entry) {
            e.constructor.name === "CssModule" && recursiveIssuer(e) === "style";
          },
          chunks: "all",
          enforce: true
        },
        material: {
          name: "material",
          test: function(e, r, entry) {
            e.constructor.name === "CssModule" && recursiveIssuer(e) === "material";
          },
          chunks: "all",
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      { test: /\.(sc|sa|c)ss$/,
        use: [
          {
            loader: ExtractCss.loader,
            options: {
              publicPath: "dist/style/"
            }
          },
          "css-loader",
          "sass-loader",
        ]
      },
      { test: /\.(woff2|woff|ttf|eot|svg)/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          publicPath: "fonts",
          outputPath: "style/fonts/"
        }
      },
      { test: /\.(webp)/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          publicPath: "image",
          outputPath: "style/image/"
        }
      },
    ]
  },
  plugins: [
    new ExtractCss({
      filename: "style/[name].css",
      chunkFileName: "[id].css",
    })
  ]
}

module.exports = config;