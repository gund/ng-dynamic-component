import { InjectionToken } from '@angular/core';
import { DynamicComponentInjector } from './component-injector';

/**
 * @public
 */
export const DynamicComponentInjectorToken =
  new InjectionToken<DynamicComponentInjector>('DynamicComponentInjector');
