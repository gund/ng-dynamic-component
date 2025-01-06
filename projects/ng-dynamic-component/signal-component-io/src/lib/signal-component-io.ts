import { ComponentRef, Injectable } from '@angular/core';
// @ts-ignore
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentIO, ComponentInputKey } from 'ng-dynamic-component';
import { Observable, isObservable } from 'rxjs';

/** @internal */
@Injectable()
export class SignalComponentIO implements ComponentIO {
  setInput<T, K extends ComponentInputKey<T>>(
    componentRef: ComponentRef<T>,
    name: K,
    value: T[K],
  ): void {
    componentRef.setInput(name, value);
  }

  getOutput<T, K extends ComponentInputKey<T>>(
    componentRef: ComponentRef<T>,
    name: K,
  ): Observable<unknown> {
    const output = componentRef.instance[name];

    if (isObservable(output)) {
      return output;
    }

    if (this.isOutputSignal(output)) {
      return outputToObservable(output);
    }

    throw new Error(`Component ${name} is not an output!`);
  }

  private isOutputSignal(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as any)['subscribe'] === 'function'
    );
  }
}
