/* eslint-disable @angular-eslint/component-selector */
import { Component, EventEmitter, Input, Output, Type } from '@angular/core';
import { TestSetup } from '../../../test';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { ComponentOutletIoDirective } from './component-outlet-io.directive';

describe('Directive: ComponentOutletIo', () => {
  @Component({ selector: 'dynamic', template: 'DynamicComponent' })
  class DynamicComponent {
    @Input() prop1: any;
    @Input() prop2: any;
    @Output() output = new EventEmitter<any>();
  }

  @Component({
    selector: 'host',
    template: `<ng-container *ngComponentOutlet="component"></ng-container>`,
  })
  class HostComponent {
    component?: Type<any>;
  }

  const testSetup = new TestSetup(HostComponent, {
    props: { component: DynamicComponent },
    ngModule: {
      declarations: [
        ComponentOutletIoDirective,
        ComponentOutletInjectorDirective,
        DynamicComponent,
      ],
    },
  });

  describe('inputs with `NgComponentOutlet` * syntax', () => {
    it('should be passed to dynamic component instance', async () => {
      const inputs = { prop1: '123', prop2: 1 };

      const fixture = await testSetup.redner<{ inputs: any }>({
        props: { inputs },
        template: `<ng-container *ngComponentOutlet="component; ndcDynamicInputs: inputs"></ng-container>`,
      });

      expect(fixture.getComponent(DynamicComponent)).toEqual(
        expect.objectContaining({
          prop1: '123',
          prop2: 1,
        }),
      );
    });
  });

  describe('outputs with `NgComponentOutlet` * syntax', () => {
    it('should be passed to dynamic component instance', async () => {
      const outputs = { output: jest.fn() };

      const fixture = await testSetup.redner<{ outputs: any }>({
        props: { outputs },
        template: `<ng-container *ngComponentOutlet="component; ndcDynamicOutputs: outputs"></ng-container>`,
      });

      expect(outputs.output).not.toHaveBeenCalled();

      fixture.getComponent(DynamicComponent)!.output.emit('data');

      expect(outputs.output).toHaveBeenCalledWith('data');
    });
  });
});
