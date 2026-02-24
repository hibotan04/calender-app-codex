const { withPodfile } = require("expo/config-plugins");

const withGrpcWorkaround = (config) => {
  return withPodfile(config, (config) => {
    let contents = config.modResults.contents;

    // Add the workaround block inside the post_install hook
    // If post_install already exists, Expo CLI usually adds it at the bottom.
    // We can inject our hook.
    const grpcPatch = `
  # GRPC Workaround for Firebase Static Frameworks linking issue
  installer.pods_project.targets.each do |target|
    if target.name == 'gRPC-C++' or target.name == 'gRPC-Core'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        config.build_settings['DEFINES_MODULE'] = 'YES'
      end
    end
  end
`;

    // Try injecting before the end of the post_install block if it exists
    if (contents.includes("post_install do |installer|")) {
      contents = contents.replace(
        /post_install do \|installer\|([\s\S]*?)end/g,
        (match, inner) => {
          if (!inner.includes("gRPC-Core")) {
            return `post_install do |installer|\n${inner}\n${grpcPatch}\nend`;
          }
          return match;
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
