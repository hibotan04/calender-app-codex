const { withPodfile } = require("expo/config-plugins");

const withGrpcWorkaround = (config) => {
  return withPodfile(config, (config) => {
    let contents = config.modResults.contents;

    const grpcPatch = `
  # Allow non-modular includes in all targets to fix RNFBApp / React-Core header issues
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
    
    # Specific workaround for Firebase Static Frameworks linking issue (gRPC)
    if target.name == 'gRPC-C++' or target.name == 'gRPC-Core'
      target.build_configurations.each do |config|
        config.build_settings['DEFINES_MODULE'] = 'YES'
      end
    end
  end
`;

    if (contents.includes("post_install do |installer|")) {
      // Remove any previously injected gRPC workaround so we don't duplicate
      contents = contents.replace(/# GRPC Workaround[\s\S]*?end\n  end/g, "");

      contents = contents.replace(
        /post_install do \|installer\|([\s\S]*?)end/g,
        (match, inner) => {
          return `post_install do |installer|\n${inner}\n${grpcPatch}\nend`;
        }
      );
    } else {
      contents += `\npost_install do |installer|\n${grpcPatch}\nend\n`;
    }

    config.modResults.contents = contents;
    return config;
  });
};

module.exports = withGrpcWorkaround;
