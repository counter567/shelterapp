const fs = require("fs");
/* config-overrides.js */
module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };

  config.optimization.runtimeChunk = false;
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
  return config;
};
