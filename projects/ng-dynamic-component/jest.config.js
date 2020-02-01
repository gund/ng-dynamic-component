module.exports = {
  setupFiles: ['<rootDir>/projects/ng-dynamic-component/src/polyfills.ts'],
  coverageDirectory: '<rootDir>/coverage/ng-dynamic-component',
  coveragePathIgnorePatterns: ['/node_modules/', '/src/test/'],
  globals: {
    'ts-jest': {
      // TS throws warnings when module=es2015|esnext is used
      // @see https://github.com/kulshekhar/ts-jest/issues/748
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
};
