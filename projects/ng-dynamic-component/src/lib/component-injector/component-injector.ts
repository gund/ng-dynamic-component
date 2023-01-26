import { ComponentRef } from '@angular/core';

/**
 * @public
 */
export interface DynamicComponentInjector {
  componentRef: ComponentRef<unknown> | null;
}
