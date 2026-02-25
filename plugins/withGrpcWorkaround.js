const { withPodfile } = require("expo/config-plugins");

const withGrpcWorkaround = (config) => {
  return withPodfile(config, (config) => {
    let contents = config.modResults.contents;

    const grpcPatch = `
  # Allow non-modular includes in all targets to fix RNFBApp / React-Core header issues
  # AND disable strict C99 implicit int errors enforced by newer Xcode versions
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      
      # Suppress implicit int and warning-as-error safely
      current_cflags = config.build_settings['OTHER_CFLAGS'] || '$(inherited)'
      unless current_cflags.include?('-Wno-error=implicit-int')
        extra_flags = ['-Wno-error=implicit-int', '-Wno-implicit-int', '-Wno-error=incompatible-pointer-types', '-Wno-error=int-conversion', '-Wno-error=deprecated-declarations']
        if current_cflags.is_a?(Array)
          config.build_settings['OTHER_CFLAGS'] = current_cflags + extra_flags
        else
          config.build_settings['OTHER_CFLAGS'] = current_cflags + ' ' + extra_flags.join(' ')
        end
      end
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
      contents = contents.replace(/# Allow non-modular includes[\s\S]*?end\n  end/g, "");

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
