const webpack = require('webpack');
const path = require('path');

const root = path.resolve(__dirname);
const nodeModules = path.resolve(root, 'node_modules');
const src = path.resolve(root, 'src');

module.exports = {
  entry: path.resolve(src, 'test.ts'),
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        exclude: [nodeModules]
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader',
        exclude: [
          path.resolve(root, 'node_modules/rxjs'),
          path.resolve(root, 'node_modules/@angular')
        ]
      },
      {
        test: /\.ts$/,
        loaders: [
          {
            loader: 'awesome-typescript-loader',
            query: {
              tsconfig: path.resolve(root, 'tsconfig.json'),
              module: 'commonjs',
              target: 'es5',
              useForkChecker: true
            }
          },
          {
            loader: 'angular2-template-loader'
          }
        ],
        exclude: [/\.e2e\.ts$/]
      },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.(js|ts)$/, loader: 'sourcemap-istanbul-instrumenter-loader',
        enforce: 'post',
        exclude: [
          /\.(e2e|spec)\.ts$/,
          /node_modules/
        ],
        query: { 'force-sourcemap': true }
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      src
    ),
    new webpack.SourceMapDevToolPlugin({
      filename: null, // if no value is provided the sourcemap is inlined
      test: /\.(ts|js)($|\?)/i // process .js and .ts files only
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        tslint: {
          emitErrors: false,
          failOnHint: false,
          resourcePath: src
        }
      }
    })
  ],
  node: {
    global: true,
    process: false,
    crypto: false,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
