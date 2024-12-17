import { isObservable, Observable } from 'rxjs';
import { ComponentInputKey, ComponentIO } from './component-io';
import { ComponentRef, Injectable } from '@angular/core';

/** @internal */
@Injectable()
export class ClassicComponentIO implements ComponentIO {
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

    if (!isObservable(output)) {
      throw new Error(`Component ${name} is not an output!`);
    }

    return output;
  }
}
