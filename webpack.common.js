const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // Clean up old builds
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@_types": path.resolve(__dirname, "./src/types"),
      "@apps": path.resolve(__dirname, "./src/apps"),
    },
  },
  module: {
    rules: [
      {
        test: /\.wgsl$/,
        use: 'raw-loader',
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|vs|fs)$/, // Support GLSL shaders
        loader: "glsl-shader-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
