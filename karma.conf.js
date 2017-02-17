const ENV = process.env.npm_lifecycle_event;
const runOnce = ENV.includes('once');

module.exports = function (config) {
  const testWebpackConfig = require('./webpack.test.js');

  const configuration = {
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [],
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    files: [{ pattern: './src/test.ts', watched: false }],
    preprocessors: { './src/test.ts': ['webpack', 'sourcemap'] },
    webpack: testWebpackConfig,
    webpackMiddleware: {
      noInfo: true, // Hide webpack output because its noisy.
      stats: { // Also prevent chunk and module display output, cleaner look. Only emit errors.
        assets: false,
        colors: true,
        version: false,
        hash: false,
        timings: false,
        chunks: false,
        chunkModules: false
      }
    },
    remapIstanbulReporter: {
      reports: {
        html: './coverage/html',
        lcovonly: './coverage/coverage.lcov',
        json: './coverage/coverage.json'
      },
      remapOptions: {
        exclude: /(test|polyfills).ts$/
      }
    },
    webpackServer: { noInfo: true },
    reporters: ['mocha', 'karma-remap-istanbul', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      reports: ['text-summary']
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: [
      'Chrome'
    ],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    autoWatch: !runOnce,
    singleRun: runOnce
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set(configuration);
};
