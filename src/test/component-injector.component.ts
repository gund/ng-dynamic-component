import { ComponentInjector } from '../dynamic';
import { Component, ComponentRef, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'component-injector',
  template: '',
})
export class ComponentInjectorComponent implements ComponentInjector {
  component = new MockedInjectedComponent();
  injectorGet = jest.fn();

  get componentRef(): ComponentRef<ComponentInjectorComponent> {
    return this.component
      ? ({
          instance: this.component,
          injector: { get: this.injectorGet },
        } as any)
      : null;
  }
}

export class MockedInjectedComponent {
  ngOnChanges = jest.fn();
  onEvent = new EventEmitter<any>();
}
