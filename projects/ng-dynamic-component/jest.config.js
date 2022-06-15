module.exports = {
  setupFiles: ['<rootDir>/projects/ng-dynamic-component/src/polyfills.ts'],
  coverageDirectory: '<rootDir>/coverage/ng-dynamic-component',
  coveragePathIgnorePatterns: ['/node_modules/', '/src/test/'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
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
