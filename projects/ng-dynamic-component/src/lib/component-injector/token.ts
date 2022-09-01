import { InjectionToken } from '@angular/core';
import { DynamicComponentInjector } from './component-injector';

export const DynamicComponentInjectorToken =
  new InjectionToken<DynamicComponentInjector>('DynamicComponentInjector');
