const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: `${__dirname}/public/assets/scripts/index.js`,
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'public', 'dist', 'scripts'),
    publicPath: 'public/dist/scripts/',
  },

  devServer: {
    contentBase: './public',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                { useBuiltIns: 'usage', corejs: { version: 3 } },
              ],
            ],
          },
        },
      },
      {
        test: /\.(scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [new CleanPlugin.CleanWebpackPlugin()],
};
