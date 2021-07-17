module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    ignore: ['react-native-shadow-2'],
  };
};
