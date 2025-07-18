const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const adNetwork = process.env.AD_NETWORK || 'default';
  
  return {
    entry: './src/index.js',
    output: {
      filename: "playable.js",
      path: path.resolve(__dirname, 'dist', adNetwork),
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            }
          }
        },
        {
          test: /\.(gif|png|jpe?g|svg|mp3|m4a|ogg|wav|json|xml$)$/i,
          type: 'asset/inline'
        },
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        CANVAS_RENDERER: JSON.stringify(true),
        WEBGL_RENDERER: JSON.stringify(true),
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.AD_NETWORK': JSON.stringify(process.env.AD_NETWORK || 'default')
      }),
      // Disable for .js only file Build
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
        minify: {
          removeComments: true,
          collapseWhitespace: true
        }
      }),
    ]
  };
};
