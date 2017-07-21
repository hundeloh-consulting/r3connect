const webpack = require('webpack')
const path = require('path')

module.exports = {
  cache: true,
  devtool: 'source-map',
  target: 'node',
  entry: {
    index: path.resolve('./src/index.js'),
    CLI: path.resolve('./src/CLI.js'),
  },
  output: {
    path: path.resolve('./build/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  node: {
    __dirname: true,
  },
  resolve: {
    modules: ['node_modules'],
  },
  externals: [
    'noderfc',
    // Non-relative module (i.e. node_modules)
    /^[a-z\-0-9]+$/,
  ],
  plugins: [
    // new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: JSON.stringify({
              babelrc: true,
              cacheDirectory: true,
            }),
          },
        ],
      },
      {
        test: /\.json?$/,
        use: [
          {
            loader: 'json-loader',
          },
        ],
      },
    ],
  },
}
