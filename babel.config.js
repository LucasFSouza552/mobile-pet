module.exports = function (api) {
  api.cache(true);
  
  const plugins = [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
  ];
  
  try {
    require.resolve('babel-plugin-module-resolver');
    plugins.push([
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
        },
      },
    ]);
  } catch (e) {
    console.error('Error resolving module-resolver:', e);
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
