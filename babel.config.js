module.exports = function (api) {
  api.cache(true);
  
  const plugins = [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
  ];
  
  // Tenta adicionar o module-resolver apenas se estiver disponível
  // O Jest usa moduleNameMapper ao invés do plugin do Babel para resolver paths
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
    // Se o plugin não estiver disponível, ignora
    // O Jest usará o moduleNameMapper configurado no jest.config.js
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
