const path = require('path');

module.exports = {
  watchFolders: [path.resolve(__dirname, '../src')],
  resolver: { // below is also needed! Else it will complain that modules of shared wasn't found!
    extraNodeModules: {
      shared: path.resolve(__dirname, '../src'),
    },
  },
};