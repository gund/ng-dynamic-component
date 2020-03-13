import { browserWindowFactory } from './window-ref-browser';

describe('function browserWindowFactory()', () => {
  it('should return global `window` object', () => {
    expect(browserWindowFactory()).toBe(window);
  });
});
