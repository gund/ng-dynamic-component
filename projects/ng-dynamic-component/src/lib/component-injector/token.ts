import { ComponentRef, InjectionToken } from '@angular/core';

export interface DynamicComponentInjector {
  componentRef: ComponentRef<unknown> | null;
}

export const DynamicComponentInjectorToken =
  new InjectionToken<DynamicComponentInjector>('DynamicComponentInjector');
