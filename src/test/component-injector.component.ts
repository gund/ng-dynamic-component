import { ComponentInjector } from '../dynamic';
import { Component, ComponentRef, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'component-injector',
  template: ''
})
export class ComponentInjectorComponent implements ComponentInjector {

  component = new MockedInjectedComponent();

  get componentRef(): ComponentRef<ComponentInjectorComponent> {
    return {
      instance: this.component
    } as any;
  };

}

export class MockedInjectedComponent {
  ngOnChanges = jest.fn();
  onEvent = new EventEmitter<any>();
}
