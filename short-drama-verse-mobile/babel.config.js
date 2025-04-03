module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@assets': './assets',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@lib': './src/lib',
            '@types': './src/types',
            '@utils': './src/utils',
            '@constants': './src/constants'
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};