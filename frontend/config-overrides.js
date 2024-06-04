const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
/* config-overrides.js */
module.exports = function override(config, env) {
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };
  config.output.filename = "static/js/[name].js";
  config.output.chunkFilename = "static/js/[name].chunk.js";
  config.plugins.forEach((plugin) => {
    if (plugin instanceof MiniCssExtractPlugin) {
      Object.assign(plugin.options, {
        filename: "static/css/[name].css",
        chunkFilename: "static/css/[name].chunk.css",
      });
    }
  });
  config.optimization.runtimeChunk = false;
  // fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
  return config;
};
