import { ComponentRef, OpaqueToken } from '@angular/core';

export interface ComponentInjector {
  componentRef: ComponentRef<any>;
}

export const COMPONENT_INJECTOR = new OpaqueToken('ComponentInjector');
