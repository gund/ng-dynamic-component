import { ComponentRef, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClassicComponentIO } from './classic-component-io';

/** @public */
@Injectable({ providedIn: 'root', useClass: ClassicComponentIO })
export abstract class ComponentIO {
  abstract setInput<T, K extends ComponentInputKey<T>>(
    componentRef: ComponentRef<T>,
    name: K,
    value: T[K],
  ): void;
  abstract getOutput<T, K extends ComponentInputKey<T>>(
    componentRef: ComponentRef<T>,
    name: K,
  ): Observable<unknown>;
}

/** @public */
export type ComponentInputKey<T> = keyof T & string;
