const { withPodfile } = require("expo/config-plugins");

const withModularHeaders = (config) => {
  return withPodfile(config, (config) => {
    const contents = config.modResults.contents;
    if (!contents.includes("use_modular_headers!")) {
      config.modResults.contents = "use_modular_headers!\n" + contents;
    }
    return config;
  });
};

module.exports = withModularHeaders;
