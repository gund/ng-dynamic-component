import { OnChanges, OnDestroy, Type } from '@angular/core';

export function noop(): void {}

export function getCtorParamTypes(
  ctor: unknown,
  reflect: { getMetadata: (type: string, obj: unknown) => unknown[] },
): unknown[] {
  return reflect.getMetadata('design:paramtypes', ctor);
}

/**
 * Extract type arguments from Angular Directive/Component
 */
export function extractNgParamTypes(
  type: Type<unknown>,
): unknown[] | undefined {
  // NOTE: Accessing private APIs of Angular
  return (type as any)?.ctorParameters?.()?.map((param) => param.type);
}

export function isOnDestroy(obj: unknown): obj is OnDestroy {
  return obj && typeof (obj as OnDestroy).ngOnDestroy === 'function';
}

export function isOnChanges(obj: unknown): obj is OnChanges {
  return obj && typeof (obj as OnChanges).ngOnChanges === 'function';
}
