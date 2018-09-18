const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    hot: true
  },
  entry: './src/index.ts',
  mode: 'development',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
              modules: true
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'build/assets'
            }
          }
        ]
      }
    ]
  },
  output: {
    filename: 'build/[name].bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin()
  ],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'assets'),
    },
    extensions: [ '.ts', '.tsx', '.js' ],
    modules: [ 'node_modules', 'src' ]
  }
}
