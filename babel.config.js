module.exports = function(api) {
  api.cache(true);

  const plugins = [
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          '@rainbow-me/routes': './src/navigation/routesNames',
          '@rainbow-me/styles': './src/styles',
          'logger': './src/utils/logger',
          'react-native-cool-modals': './src/react-native-cool-modals',
        },
        root: ['./src'],
      },
    ],
    'babel-plugin-styled-components',
    'date-fns',
    'graphql-tag',
    ['lodash', { id: ['lodash', 'recompact'] }],
  ];

  const presets = [
    'module:metro-react-native-babel-preset',
    'module:react-native-dotenv',
  ];

  return {
    env: {
      development: {
        plugins: [
          ...plugins,
          [
            'transform-remove-console',
            { exclude: ['disableYellowBox', 'error', 'info', 'log'] },
          ],
        ],
        presets: presets,
      },
      production: {
        plugins: [
          ...plugins,
          '@babel/plugin-transform-runtime',
          '@babel/plugin-transform-react-inline-elements',
          ['transform-remove-console', { exclude: ['error'] }],
        ],
        presets: presets,
      },
    },
    plugins,
    presets,
  };
};
