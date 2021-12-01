import { NgClass } from '@angular/common';

import { extractNgParamTypes } from './util';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('Util', () => {
  describe('function extractNgParamTypes()', () => {
    it('should return constructor argument types collected by NGC', () => {
      const args = extractNgParamTypes(NgClass);

      // To be more flexible just check that there are some arguments
      // and do not check for specific types as they are irrelevant and may change
      expect(args.length).toBeGreaterThan(0);
    });

    it('should return `undefined` for constructor not processed by NGC', () => {
      // eslint-disable-next-line @angular-eslint/component-selector
      @Component({ selector: 'test', template: '' })
      class TestComponent {}

      TestBed.configureTestingModule({
        declarations: [TestComponent],
      }).compileComponents();

      const args = extractNgParamTypes(TestComponent);

      expect(args).toBe(undefined);
    });
  });
});
