import { ComponentRef } from '@angular/core';
import { of } from 'rxjs';
import { ClassicComponentIO } from './classic-component-io';

class MockComponentRef<C> {
  constructor(public instance: C) {}
  setInput = jest.fn();
}

describe('ClassicComponentIO', () => {
  function setup<C>(instance: C = {} as any) {
    const componentIO = new ClassicComponentIO();
    const mockComponentRef = new MockComponentRef(
      instance,
    ) as MockComponentRef<C> & ComponentRef<Record<string, unknown>>;

    return { componentIO, mockComponentRef };
  }

  describe('setInput()', () => {
    it('should call ComponentRef.setInput()', () => {
      const { componentIO, mockComponentRef } = setup();

      componentIO.setInput(mockComponentRef, 'prop', 'value');

      expect(mockComponentRef.setInput).toHaveBeenCalledWith('prop', 'value');
    });
  });

  describe('getOutput()', () => {
    it('should return observable output as is', () => {
      const output = of('event');
      const { componentIO, mockComponentRef } = setup({ output });

      componentIO.getOutput(mockComponentRef, 'output');

      expect(componentIO.getOutput(mockComponentRef, 'output')).toBe(output);
    });

    it('should throw if output not an observable', () => {
      const output = 'not observable';
      const { componentIO, mockComponentRef } = setup({ output });

      expect(() =>
        componentIO.getOutput(mockComponentRef, 'output'),
      ).toThrowError('Component output is not an output!');
    });
  });
});
