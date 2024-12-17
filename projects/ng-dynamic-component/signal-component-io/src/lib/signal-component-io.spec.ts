import { ComponentRef } from '@angular/core';
// @ts-ignore
import { outputToObservable } from '@angular/core/rxjs-interop';
import { SignalComponentIO } from './signal-component-io';
import { of } from 'rxjs';

jest.mock(
  '@angular/core/rxjs-interop',
  () => ({ outputToObservable: jest.fn() }),
  { virtual: true },
);

class MockComponentRef<C> {
  constructor(public instance: C) {}
  setInput = jest.fn();
}

describe('SignalComponentIO', () => {
  function setup<C>(instance: C = {} as any) {
    const componentIO = new SignalComponentIO();
    const mockComponentRef = new MockComponentRef(
      instance,
    ) as MockComponentRef<C> & ComponentRef<Record<string, unknown>>;
    const mockOutputToObservable = outputToObservable as jest.Mock;

    return { componentIO, mockComponentRef, mockOutputToObservable };
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

    it('should convert signal output to observalbe', () => {
      const signal = { subscribe: jest.fn() };
      const observable = of('signal');
      const { componentIO, mockComponentRef, mockOutputToObservable } = setup({
        signal,
      });

      mockOutputToObservable.mockReturnValue(observable);

      expect(componentIO.getOutput(mockComponentRef, 'signal')).toBe(
        observable,
      );
      expect(mockOutputToObservable).toHaveBeenCalledWith(signal);
    });

    it('should throw if output not an observable/signal', () => {
      const output = 'not observable/signal';
      const { componentIO, mockComponentRef } = setup({ output });

      expect(() =>
        componentIO.getOutput(mockComponentRef, 'output'),
      ).toThrowError('Component output is not an output!');
    });
  });
});
