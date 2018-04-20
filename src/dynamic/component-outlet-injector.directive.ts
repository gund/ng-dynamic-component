import { NgComponentOutlet } from '@angular/common';
import { ComponentRef, Directive, Host } from '@angular/core';

import { ComponentInjector } from './component-injector';

@Directive({
  selector: '[ngComponentOutlet]',
  exportAs: 'ndcComponentOutletInjector',
})
export class ComponentOutletInjectorDirective implements ComponentInjector {
  get componentRef(): ComponentRef<any> {
    return (<any>this.componentOutlet)._componentRef;
  }

  constructor(@Host() private componentOutlet: NgComponentOutlet) {}
}
