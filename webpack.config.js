const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { withAlias } = require('@expo/webpack-config/addons');

const reactNativeWebWebviewConfiguration = {
  test: /postMock.html$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
    },
  },
};

module.exports = async function (env, argv) {
  let config = await createExpoWebpackConfigAsync(env, argv);
  config = withAlias(config, {
    'react-native$': 'react-native-web',
    'react-native-linear-gradient': 'react-native-web-linear-gradient',
    'react-native-webview': 'react-native-web-webview',
  });
  config.module.rules = [
    ...(config.module.rules || []),
    reactNativeWebWebviewConfiguration,
  ];
  config.resolve.fallback = {
    'http': false,
    'zlib': false,
    'url': false,
    'stream': false,
    'https': false,
    'crypto': false,
  };
  return config;
};
