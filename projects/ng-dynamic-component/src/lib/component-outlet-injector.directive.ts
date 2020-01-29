import { NgComponentOutlet } from '@angular/common';
import { ComponentRef, Directive, Host } from '@angular/core';

import { ComponentInjector } from './component-injector';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[ngComponentOutlet]',
  exportAs: 'ndcComponentOutletInjector',
})
export class ComponentOutletInjectorDirective implements ComponentInjector {
  get componentRef(): ComponentRef<any> {
    return (this.componentOutlet as any)._componentRef;
  }

  constructor(@Host() private componentOutlet: NgComponentOutlet) {}
}
