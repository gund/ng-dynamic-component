import { OnDestroy, Type } from '@angular/core';

/**
 * Extract type arguments from Angular Directive/Component
 */
export function extractNgParamTypes(
  type: Type<unknown>,
): unknown[] | undefined {
  // NOTE: Accessing private APIs of Angular
  return (type as any)?.ctorParameters?.()?.map((param: any) => param.type);
}

export function isOnDestroy(obj: unknown): obj is OnDestroy {
  return !!obj && typeof (obj as OnDestroy).ngOnDestroy === 'function';
}
