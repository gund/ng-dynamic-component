/* eslint-disable @angular-eslint/component-selector */
import { Component, ComponentRef, Type, ViewChild } from '@angular/core';
import { TestSetup } from '../../test';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';

describe('ComponentOutletInjectorDirective', () => {
  @Component({ selector: 'dynamic', template: '' })
  class Dynamic1Component {}

  @Component({
    selector: 'host',
    template: `<ng-container *ngComponentOutlet="component"></ng-container>`,
  })
  class HostComponent {
    @ViewChild(ComponentOutletInjectorDirective, { static: false })
    directive?: ComponentOutletInjectorDirective;
    component?: Type<any>;
  }

  const testSetup = new TestSetup(HostComponent, {
    props: { component: Dynamic1Component },
    ngModule: {
      imports: [ComponentOutletInjectorDirective],
      declarations: [Dynamic1Component],
    },
  });

  it('should be bound to `[ngComponentOutlet]` directive', async () => {
    const fixture = await testSetup.redner();

    const directive = fixture.getHost().directive;

    expect(directive).toBeInstanceOf(ComponentOutletInjectorDirective);
  });

  it('should return injected `ComponentRef` in `componentRef` prop', async () => {
    const fixture = await testSetup.redner();

    const directive = fixture.getHost().directive;

    expect(directive?.componentRef).toBeInstanceOf(ComponentRef);
  });

  it('should hold instance of injected component in `componentRef`', async () => {
    const fixture = await testSetup.redner();

    const directive = fixture.getHost().directive;

    expect(directive?.componentRef.instance).toBeInstanceOf(Dynamic1Component);
  });
});
