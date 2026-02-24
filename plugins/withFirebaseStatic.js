const { withPodfile } = require("expo/config-plugins");

const withFirebaseStatic = (config) => {
  return withPodfile(config, (config) => {
    const contents = config.modResults.contents;
    if (!contents.includes("$RNFirebaseAsStaticFramework = true")) {
      config.modResults.contents = "$RNFirebaseAsStaticFramework = true\n" + contents;
    }
    return config;
  });
};

module.exports = withFirebaseStatic;
