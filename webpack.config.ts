const path = require('path');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
  entry: './src/script.ts', 
  output: {
    filename: 'script.js', 
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'], 
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: mode,
  watch: mode === 'development',
};
