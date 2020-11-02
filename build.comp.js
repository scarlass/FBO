/** @type {import("webpack").Configuration} */
const config = {
  entry: {
    goal: "./src/goal.ts",
    app: "./src/app.tsx",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  module: {
    rules: [
      { test: /\.(ts|tsx|js|jsx)$/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-react",
            "@babel/preset-typescript"
          ],
          plugins: [
            "@babel/plugin-proposal-object-rest-spread",
            "@babel/plugin-proposal-class-properties"
          ]
        }
      },
    ]
  },
};

module.exports = config;