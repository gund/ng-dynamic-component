/* eslint-disable @angular-eslint/no-output-rename */
/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @angular-eslint/component-selector */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestFixture, TestSetup } from '../../test';
import { ComponentOutletInjectorModule } from '../component-outlet';
import { DynamicComponent as NdcDynamicComponent } from '../dynamic.component';
import { InputsType, IoEventArgumentToken, OutputsType } from '../io';
import {
  IoEventContextProviderToken,
  IoEventContextToken,
} from '../io/event-context';
import { DynamicIoDirective } from './dynamic-io.directive';

describe('Directive: DynamicIo', () => {
  @Component({
    selector: 'dynamic',
    template: `
      <p>Input1: {{ input1 }}</p>
      <p>Input2: {{ input2 }}</p>
      <p>Input3: {{ input3 }}</p>
    `,
  })
  class DynamicComponent implements OnInit, OnChanges {
    @Input() input1: any;
    @Input() input2: any;
    @Input('input3Renamed') input3: any;
    @Output() output1 = new EventEmitter<any>();
    @Output() output2 = new EventEmitter<any>();
    @Output('output3Renamed') output3 = new EventEmitter<any>();
    ngOnInitSpy = jest.fn();
    ngOnChangesSpy = jest.fn();
    ngOnInit(): void {
      this.ngOnInitSpy();
    }
    ngOnChanges(changes: SimpleChanges): void {
      this.ngOnChangesSpy(changes);
    }
  }

  @Component({
    selector: 'host',
    template: `<ng-container
      [ngComponentOutlet]="component"
      [ndcDynamicInputs]="inputs"
      [ndcDynamicOutputs]="outputs"
    ></ng-container>`,
  })
  class HostComponent {
    component?: Type<any> | null;
    inputs?: InputsType | null;
    outputs?: OutputsType | null;
  }

  class DynamicTestFixture<THost> extends TestFixture<THost> {
    getDynamicComponent() {
      return this.getComponent(DynamicComponent)!;
    }
    getDynamicElement() {
      return this.getComponentElement(DynamicComponent)!;
    }
    getDynamicParagraphs() {
      return this.getDynamicElement()?.queryAll(By.css('p'))!;
    }
  }

  const testSetup = new TestSetup(HostComponent, {
    props: { component: DynamicComponent },
    ngModule: {
      imports: [CommonModule, ComponentOutletInjectorModule],
      declarations: [DynamicComponent, DynamicIoDirective],
    },
    fixtureCtor: DynamicTestFixture,
  });

  describe('inputs', () => {
    it('should be passed to component', async () => {
      const inputs = { input1: 'val1', input2: 'val2', input3Renamed: 'val3' };

      const fixture = await testSetup.redner({ props: { inputs } });

      expect(fixture.getDynamicComponent()).toEqual(
        expect.objectContaining({
          input1: 'val1',
          input2: 'val2',
          input3: 'val3',
        }),
      );
    });

    it('should be reassigned when replaced', async () => {
      const inputs = { input1: 'val1', input2: 'val2', input3Renamed: 'val3' };

      const fixture = await testSetup.redner({ props: { inputs } });

      inputs.input1 = 'new-val1';

      fixture.detectChanges();

      expect(fixture.getDynamicComponent()).toEqual(
        expect.objectContaining({
          input1: 'new-val1',
          input2: 'val2',
          input3: 'val3',
        }),
      );
    });

    it('should be reassigned from `null|undefined` when replaced', async () => {
      const fixture = await testSetup.redner({ props: { inputs: null } });

      fixture.setHostProps({
        inputs: {
          input1: 'val1',
          input2: 'val2',
          input3Renamed: 'val3',
        },
      });

      expect(fixture.getDynamicComponent()).toEqual(
        expect.objectContaining({
          input1: 'val1',
          input2: 'val2',
          input3: 'val3',
        }),
      );
    });

    it('should trigger initially `OnChanges` life-cycle hook', async () => {
      const inputs = { input1: 'val1', input2: 'val2', input3Renamed: 'val3' };

      const fixture = await testSetup.redner({ props: { inputs } });
      const component = fixture.getDynamicComponent();

      expect(component.ngOnChangesSpy).toHaveBeenCalledTimes(1);
      expect(component.ngOnChangesSpy).toHaveBeenCalledWith({
        input1: new SimpleChange(undefined, 'val1', true),
        input2: new SimpleChange(undefined, 'val2', true),
        input3: new SimpleChange(undefined, 'val3', true),
      });
    });

    it('should trigger `OnChanges` life-cycle hook on updates', async () => {
      const inputs = { input1: 'val1', input2: 'val2', input3Renamed: 'val3' };

      const fixture = await testSetup.redner({ props: { inputs } });
      const component = fixture.getDynamicComponent();

      component.ngOnChangesSpy.mockClear();

      inputs.input2 = 'new-val2';

      fixture.detectChanges();

      expect(component.ngOnChangesSpy).toHaveBeenCalledTimes(1);
      expect(component.ngOnChangesSpy).toHaveBeenCalledWith({
        input2: new SimpleChange('val2', 'new-val2', false),
      });
    });

    it('should trigger `OnChanges` life-cycle hook if component instance was updated', async () => {
      @Component({ selector: 'dynamic2', template: '' })
      class Dynamic2Component implements OnChanges {
        @Input() input1: any;
        @Input() input2: any;
        ngOnChangesSpy = jest.fn();
        ngOnChanges(changes: SimpleChanges): void {
          this.ngOnChangesSpy(changes);
        }
      }

      const inputs = { input1: 'val1', input2: 'val2' };

      const fixture = await testSetup.redner({
        props: { inputs },
        ngModule: { declarations: [Dynamic2Component] },
      });

      expect(
        fixture.getDynamicComponent().ngOnChangesSpy,
      ).toHaveBeenCalledTimes(1);

      fixture.setHostProps({ component: Dynamic2Component });

      const component = fixture.getComponent(Dynamic2Component)!;

      expect(component.ngOnChangesSpy).toHaveBeenCalledTimes(1);
      expect(component.ngOnChangesSpy).toHaveBeenCalledWith({
        input1: new SimpleChange(undefined, 'val1', true),
        input2: new SimpleChange(undefined, 'val2', true),
      });
    });

    it('should trigger `ngOnChanges` life-cycle hook if inputs and component updated', async () => {
      @Component({ selector: 'dynamic2', template: '' })
      class Dynamic2Component extends DynamicComponent {}

      const inputs = { input1: 'val1', input2: 'val2' };

      const fixture = await testSetup.redner({
        props: { inputs },
        ngModule: { declarations: [Dynamic2Component] },
      });

      inputs.input1 = 'new-val1';
      fixture.setHostProps({ component: Dynamic2Component });

      const component = fixture.getComponent(Dynamic2Component)!;

      expect(component.ngOnChangesSpy).toHaveBeenCalledTimes(1);
      expect(component.ngOnChangesSpy).toHaveBeenCalledWith({
        input1: new SimpleChange(undefined, 'new-val1', true),
        input2: new SimpleChange(undefined, 'val2', true),
      });
    });

    it('should render inputs with Default strategy', async () => {
      const inputs = { input1: 'val1', input2: 'val2', input3Renamed: 'val3' };

      const fixture = await testSetup.redner({ props: { inputs } });
      const [p1, p2, p3] = fixture.getDynamicParagraphs();

      expect(p1.nativeElement.textContent).toBe('Input1: val1');
      expect(p2.nativeElement.textContent).toBe('Input2: val2');
      expect(p3.nativeElement.textContent).toBe('Input3: val3');
    });

    it('should render inputs with OnPush strategy', async () => {
      TestBed.overrideComponent(DynamicComponent, {
        set: { changeDetection: ChangeDetectionStrategy.OnPush },
      });

      const inputs = { input1: 'val1', input2: 'val2', input3Renamed: 'val3' };

      const fixture = await testSetup.redner({
        props: { inputs },
        hostOverrides: {
          set: { changeDetection: ChangeDetectionStrategy.OnPush },
        },
      });
      const [p1, p2, p3] = fixture.getDynamicParagraphs();

      expect(p1.nativeElement.textContent).toBe('Input1: val1');
      expect(p2.nativeElement.textContent).toBe('Input2: val2');
      expect(p3.nativeElement.textContent).toBe('Input3: val3');
    });

    it('should NOT trigger `OnChanges` hook if not available on dynamic component', async () => {
      @Component({ selector: 'dynamic2', template: '' })
      class Dynamic2Component {
        @Input() input1: any;
        @Input() input2: any;
      }

      const inputs = { input1: 'val1', input2: 'val2' };

      expect.assertions(1);

      await expect(
        testSetup.redner({
          props: {
            component: Dynamic2Component,
            inputs,
          },
          ngModule: { declarations: [Dynamic2Component] },
        }),
      ).resolves.not.toThrow();
    });

    it('should NOT throw exception if inputs undefined', async () => {
      expect.assertions(1);

      await expect(
        testSetup.redner({ props: { inputs: undefined } }),
      ).resolves.not.toThrow();
    });

    it('should NOT throw exception if inputs null', async () => {
      expect.assertions(1);

      await expect(
        testSetup.redner({ props: { inputs: null } }),
      ).resolves.not.toThrow();
    });

    it('should NOT throw exception when same inputs are reassigned with new object', async () => {
      const inputs = { input1: 'val1', input2: 'val2' };

      const fixture = await testSetup.redner({ props: { inputs } });

      expect(() =>
        fixture.setHostProps({ inputs: { ...inputs } }),
      ).not.toThrow();
    });

    it('should NOT throw if component injector is null', async () => {
      const inputs = { input1: 'val1', input2: 'val2' };

      expect.assertions(1);

      await expect(
        testSetup.redner({ props: { inputs, component: null } }),
      ).resolves.not.toThrow();
    });
  });

  describe('outputs', () => {
    it('should bind outputs to component and receive events', async () => {
      const outputs = {
        output1: jest.fn(),
        output2: jest.fn(),
        output3Renamed: jest.fn(),
      };

      const fixture = await testSetup.redner({ props: { outputs } });

      expect(outputs.output1).not.toHaveBeenCalled();
      expect(outputs.output2).not.toHaveBeenCalled();
      expect(outputs.output3Renamed).not.toHaveBeenCalled();

      const component = fixture.getDynamicComponent();

      component.output1.emit('val1');
      component.output2.emit('val2');
      component.output3.emit('val3');

      expect(outputs.output1).toHaveBeenCalledTimes(1);
      expect(outputs.output1).toHaveBeenCalledWith('val1');
      expect(outputs.output2).toHaveBeenCalledTimes(1);
      expect(outputs.output2).toHaveBeenCalledWith('val2');
      expect(outputs.output3Renamed).toHaveBeenCalledTimes(1);
      expect(outputs.output3Renamed).toHaveBeenCalledWith('val3');
    });

    it('should NOT bind outputs to component when outputs undefined', async () => {
      expect.assertions(1);

      await expect(
        testSetup.redner({ props: { outputs: undefined } }),
      ).resolves.not.toThrow();
    });

    it('should NOT bind outputs to component when outputs null', async () => {
      expect.assertions(1);

      await expect(
        testSetup.redner({ props: { outputs: null } }),
      ).resolves.not.toThrow();
    });

    it('should re-bind outputs after `null|undefined` to component and receive events', async () => {
      const outputs = {
        output1: jest.fn(),
        output2: jest.fn(),
        output3Renamed: jest.fn(),
      };

      const fixture = await testSetup.redner({ props: { outputs: null } });

      fixture.setHostProps({ outputs });

      const component = fixture.getDynamicComponent();

      component.output1.emit('val1');
      component.output2.emit('val2');
      component.output3.emit('val3');

      expect(outputs.output1).toHaveBeenCalledTimes(1);
      expect(outputs.output1).toHaveBeenCalledWith('val1');
      expect(outputs.output2).toHaveBeenCalledTimes(1);
      expect(outputs.output2).toHaveBeenCalledWith('val2');
      expect(outputs.output3Renamed).toHaveBeenCalledTimes(1);
      expect(outputs.output3Renamed).toHaveBeenCalledWith('val3');
    });

    it('should unbind outputs when set to null|undefined', async () => {
      const outputs = {
        output1: jest.fn(),
        output2: jest.fn(),
        output3Renamed: jest.fn(),
      };

      const fixture = await testSetup.redner({ props: { outputs } });

      fixture.setHostProps({ outputs: null });

      const component = fixture.getDynamicComponent();

      component.output1.emit('val1');
      component.output2.emit('val2');
      component.output3.emit('val3');

      expect(outputs.output1).not.toHaveBeenCalled();
      expect(outputs.output2).not.toHaveBeenCalled();
      expect(outputs.output3Renamed).not.toHaveBeenCalled();
    });

    it('should unbind outputs when component destroys', async () => {
      const outputs = {
        output1: jest.fn(),
        output2: jest.fn(),
        output3Renamed: jest.fn(),
      };

      const fixture = await testSetup.redner({ props: { outputs } });

      const component = fixture.getDynamicComponent();

      fixture.setHostProps({ component: null });

      component.output1.emit('val1');
      component.output2.emit('val2');
      component.output3.emit('val3');

      expect(outputs.output1).not.toHaveBeenCalled();
      expect(outputs.output2).not.toHaveBeenCalled();
      expect(outputs.output3Renamed).not.toHaveBeenCalled();
    });

    it('should update parent after event emits with OnPush strategy', async () => {
      let fixture: DynamicTestFixture<HostComponent & { value: any }>;

      const outputs = {
        output1: jest
          .fn()
          .mockImplementation((value) =>
            fixture.setHostPropsNoDetect({ value }),
          ),
      };

      fixture = await testSetup.redner<{ value: any }>({
        props: { outputs },
        template: `
          <ng-container [ngComponentOutlet]="component"
            [ndcDynamicOutputs]="outputs"
          ></ng-container>
          <p class="output">Output: {{value}}<p>
        `,
        hostOverrides: {
          set: { changeDetection: ChangeDetectionStrategy.OnPush },
        },
      });

      fixture.getDynamicComponent().output1.emit('val1');

      expect(outputs.output1).toHaveBeenCalledTimes(1);

      fixture.detectChanges();

      const outputElem = fixture.fixture.debugElement.query(By.css('.output'));

      expect(outputElem.nativeElement.textContent).toBe('Output: val1');
    });
  });

  describe('outputs with template arguments', () => {
    it('should bind outputs with event without specifying template arguments', async () => {
      const outputs = {
        output: jest.fn(),
      };

      const fixture = await testSetup.redner({
        props: { outputs },
        template: `
          <ng-container [ngComponentOutlet]="component"
            [ndcDynamicOutputs]="{ output1: { handler: outputs.output } }"
          ></ng-container>
        `,
      });

      fixture.getDynamicComponent().output1.emit('val1');

      expect(outputs.output).toHaveBeenCalledTimes(1);
      expect(outputs.output).toHaveBeenCalledWith('val1');
    });

    it('should bind outputs without event when set to null/undefined', async () => {
      const outputs = {
        output: jest.fn(),
      };

      const fixture = await testSetup.redner({
        props: { outputs },
        template: `
          <ng-container [ngComponentOutlet]="component"
            [ndcDynamicOutputs]="{ output1: { handler: outputs.output, args: null } }"
          ></ng-container>
        `,
      });

      fixture.getDynamicComponent().output1.emit('val1');

      expect(outputs.output).toHaveBeenCalledTimes(1);
      expect(outputs.output).toHaveBeenCalledWith();
    });

    it('should bind outputs with event and template arguments', async () => {
      const outputs = {
        output: jest.fn(),
      };

      const fixture = await testSetup.redner<{ tplVar: any }>({
        props: { outputs },
        template: `
          <ng-container [ngComponentOutlet]="component"
            [ndcDynamicOutputs]="{ output1: { handler: outputs.output, args: ['$event', tplVar] } }"
          ></ng-container>
        `,
      });

      fixture.setHostProps({ tplVar: 'from-template' });

      fixture.getDynamicComponent().output1.emit('val1');

      expect(outputs.output).toHaveBeenCalledTimes(1);
      expect(outputs.output).toHaveBeenCalledWith('val1', 'from-template');
    });

    it('should bind outputs with custom event ID', async () => {
      const outputs = {
        output: jest.fn(),
      };

      const fixture = await testSetup.redner<{ tplVar: any }>({
        props: { outputs },
        template: `
          <ng-container [ngComponentOutlet]="component"
            [ndcDynamicOutputs]="{ output1: { handler: outputs.output, args: ['$e', tplVar] } }"
          ></ng-container>
        `,
        ngModule: {
          providers: [{ provide: IoEventArgumentToken, useValue: '$e' }],
        },
      });

      fixture.setHostProps({ tplVar: 'from-template' });

      fixture.getDynamicComponent().output1.emit('val1');

      expect(outputs.output).toHaveBeenCalledTimes(1);
      expect(outputs.output).toHaveBeenCalledWith('val1', 'from-template');
    });

    it('should bind outputs with custom global context', async () => {
      const customEventContext = { customEventContext: 'global' };
      const outputs = {
        output: jest.fn().mockImplementation(function (this: unknown) {
          // Use non-strict equal due to a bug in Jest
          // that clones `this` object and destroys original ref
          expect(this).toEqual(customEventContext);
        }),
      };

      const fixture = await testSetup.redner<{ tplVar: any }>({
        props: { outputs },
        template: `
          <ng-container [ngComponentOutlet]="component"
            [ndcDynamicOutputs]="{ output1: { handler: outputs.output, args: ['$event', tplVar] } }"
          ></ng-container>
        `,
        ngModule: {
          providers: [
            { provide: IoEventContextToken, useValue: customEventContext },
          ],
        },
      });

      fixture.setHostProps({ tplVar: 'from-template' });

      fixture.getDynamicComponent().output1.emit('val1');

      expect(outputs.output).toHaveBeenCalledTimes(1);
      expect(outputs.output).toHaveBeenCalledWith('val1', 'from-template');
    });

    it('should bind outputs with custom local context', async () => {
      const customEventContext = { customEventContext: 'local' };
      const outputs = {
        output: jest.fn().mockImplementation(function (this: unknown) {
          // Use non-strict equal due to a bug in Jest
          // that clones `this` object and destroys original ref
          expect(this).toEqual(customEventContext);
        }),
      };

      const fixture = await testSetup.redner<{ tplVar: any }>({
        props: { outputs },
        template: `
          <ng-container [ngComponentOutlet]="component"
            [ndcDynamicOutputs]="{ output1: { handler: outputs.output, args: ['$event', tplVar] } }"
          ></ng-container>
        `,
        ngModule: {
          providers: [
            {
              provide: IoEventContextProviderToken,
              useValue: {
                provide: IoEventContextToken,
                useValue: customEventContext,
              },
            },
          ],
        },
      });

      fixture.setHostProps({ tplVar: 'from-template' });

      fixture.getDynamicComponent().output1.emit('val1');

      expect(outputs.output).toHaveBeenCalledTimes(1);
      expect(outputs.output).toHaveBeenCalledWith('val1', 'from-template');
    });
  });

  describe('integration', () => {
    it('should work with `ngComponentOutlet` * syntax', async () => {
      const inputs = { input1: 'val1', input2: 'val2', input3Renamed: 'val3' };

      const fixture = await testSetup.redner({
        props: { inputs },
        template: `
          <ng-container
            *ngComponentOutlet="component; ndcDynamicInputs: inputs"
          ></ng-container>
        `,
      });

      expect(fixture.getDynamicComponent()).toEqual(
        expect.objectContaining({
          input1: 'val1',
          input2: 'val2',
          input3: 'val3',
        }),
      );
    });

    it('should work with `ndc-dynamic`', async () => {
      const inputs = { input1: 'val1', input2: 'val2', input3Renamed: 'val3' };

      const fixture = await testSetup.redner({
        props: { inputs },
        template: `
          <ndc-dynamic
            [ndcDynamicComponent]="component"
            [ndcDynamicInputs]="inputs"
          ></ndc-dynamic>
        `,
        ngModule: { declarations: [NdcDynamicComponent] },
      });

      expect(fixture.getDynamicComponent()).toEqual(
        expect.objectContaining({
          input1: 'val1',
          input2: 'val2',
          input3: 'val3',
        }),
      );
    });
  });
});
