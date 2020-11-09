import { Injectable, Type } from '@angular/core';

import { WindowRefService } from './window-ref.service';

/**
 * Reflect API subsystem required for lib to work
 */
export interface ReflectRef {
  getMetadata: (type: string, obj: unknown) => unknown[];
}

/**
 * Retrieves Reflect API from global Window object
 * of {@link WindowRefService} as a `Reflect` property
 */
export function windowReflectFactory(windowRef: WindowRefService) {
  return (windowRef.nativeWindow as any).Reflect;
}

/**
 * Holds {@link ReflectRef} that is used by {@link ReflectRefService}
 */
@Injectable({
  providedIn: 'root',
  useFactory: windowReflectFactory,
  deps: [WindowRefService],
})
export class ReflectRefToken extends ((class {} as any) as Type<ReflectRef>) {}

@Injectable({ providedIn: 'root' })
export class ReflectRefService {
  readonly reflect: ReflectRef = this.reflectRefToken;

  constructor(private reflectRefToken: ReflectRefToken) {}

  getCtorParamTypes(ctor: Type<unknown>): unknown[] {
    return this.reflect.getMetadata('design:paramtypes', ctor);
  }
}
