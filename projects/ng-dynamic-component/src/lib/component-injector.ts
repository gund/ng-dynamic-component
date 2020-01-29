import { ComponentRef, InjectionToken, Type } from '@angular/core';

export interface ComponentInjector {
  componentRef: ComponentRef<any> | null;
}

export const COMPONENT_INJECTOR = new InjectionToken<Type<ComponentInjector>>(
  'ComponentInjector',
);
