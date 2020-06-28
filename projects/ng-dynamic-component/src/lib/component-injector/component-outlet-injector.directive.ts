import { NgComponentOutlet } from '@angular/common';
import { ComponentRef, Directive, Host } from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from './token';

@Directive({
  // tslint:disable-next-line: directive-selector
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
  implements DynamicComponentInjector {
  get componentRef(): ComponentRef<any> {
    // NOTE: Accessing private APIs of Angular
    return (this.componentOutlet as any)._componentRef;
  }

  constructor(@Host() private componentOutlet: NgComponentOutlet) {}
}
