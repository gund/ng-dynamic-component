import { ComponentRef, InjectionToken } from '@angular/core';

export interface DynamicComponentInjector {
  componentRef: ComponentRef<any> | null;
}

export const DynamicComponentInjectorToken =
  new InjectionToken<DynamicComponentInjector>('DynamicComponentInjector');
