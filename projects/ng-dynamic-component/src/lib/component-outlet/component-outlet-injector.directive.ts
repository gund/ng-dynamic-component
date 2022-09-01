import { NgComponentOutlet } from '@angular/common';
import { ComponentRef, Directive, Host } from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngComponentOutlet]',
  exportAs: 'ndcComponentOutletInjector',
  providers: [
    {
      provide: DynamicComponentInjectorToken,
      useExisting: ComponentOutletInjectorDirective,
    },
  ],
})
export class ComponentOutletInjectorDirective
  implements DynamicComponentInjector
{
  get componentRef(): ComponentRef<unknown> {
    // NOTE: Accessing private APIs of Angular
    return (this.componentOutlet as any)._componentRef;
  }

  constructor(@Host() private componentOutlet: NgComponentOutlet) {}
}
