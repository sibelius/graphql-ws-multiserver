const path = require('path');

const nodeExternals = require('webpack-node-externals');

const cwd = process.cwd();

export const outputPath = path.join(cwd, '.webpack');
export const outputFilename = 'bundle.js';

export default {
  context: cwd,
  mode: 'development',
  devtool: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.mjs'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: outputPath,
    filename: outputFilename,
    futureEmitAssets: true,
  },
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: [/@feedback/],
    }),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules'),
      whitelist: [/@feedback/],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        use: {
          loader: 'babel-loader?cacheDirectory',
        },
        exclude: [/node_modules/, path.resolve(__dirname, '.serverless'), path.resolve(__dirname, '.webpack')],
      },
    ],
  },
  plugins: [],
  node: {
    __dirname: false,
    __filename: false,
    fs: 'empty',
  },
};
