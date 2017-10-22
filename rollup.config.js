import nodeResolve from 'rollup-plugin-node-resolve';
import { globalsRegex, GLOBAL } from 'rollup-globals-regex';

export default {
  input: 'dist/src/ng-dynamic-component.js',
  output: {
    file: 'dist/bundles/ng-dynamic-component.es2015.js',
    format: 'es',
  },
  name: 'dynamicComponent',
  plugins: [
    nodeResolve({ jsnext: true, browser: true })
  ],
  globals: globalsRegex({
    'tslib': 'tslib',
    [GLOBAL.NG2]: GLOBAL.NG2.TPL,
    [GLOBAL.RX]: GLOBAL.RX.TPL,
    [GLOBAL.RX_OPERATOR]: GLOBAL.RX_OPERATOR.TPL,
  }),
  external: (moduleId) => {
    if (/^(\@angular|rxjs|tslib)\/?/.test(moduleId)) {
      return true;
    }

    return false;
  }
};
