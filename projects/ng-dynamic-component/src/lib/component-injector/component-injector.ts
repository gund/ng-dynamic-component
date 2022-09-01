import { ComponentRef } from '@angular/core';

export interface DynamicComponentInjector {
  componentRef: ComponentRef<unknown> | null;
}
