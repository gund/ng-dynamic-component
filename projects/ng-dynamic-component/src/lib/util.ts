import { KeyValueChangeRecord, Type } from '@angular/core';

export type KeyValueChangeRecordAny = KeyValueChangeRecord<any, any>;

export function noop(): void {}

export function getCtorParamTypes(
  ctor: any,
  reflect: { getMetadata: (type: string, obj: object) => any[] },
): any[] {
  return reflect.getMetadata('design:paramtypes', ctor);
}

/**
 * Extract type arguments from Angular Directive/Component
 */
export function extractNgParamTypes(type: Type<any>): any[] | undefined {
  // NOTE: Accessing private APIs of Angular
  return (type as any)?.ctorParameters?.()?.map((param) => param.type);
}
