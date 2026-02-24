const { withPodfile } = require("expo/config-plugins");

const withModularHeaders = (config) => {
  return withPodfile(config, (config) => {
    if (!config.modResults.contents.includes("use_modular_headers!")) {
      config.modResults.contents = "use_modular_headers!\n" + config.modResults.contents;
    }
    return config;
  });
};

module.exports = withModularHeaders;
