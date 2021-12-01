// tslint:disable: no-string-literal
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import {
  ComponentInjectorComponent,
  getByPredicate,
  InjectedBoundComponent,
  InjectedComponent,
  MockedInjectedComponent,
  TestComponent,
  TestModule,
} from '../../test';
import {
  ComponentOutletInjectorDirective,
  DynamicComponentInjectorToken,
} from '../component-injector';
import { EventArgumentToken } from '../io';
import { DynamicIoDirective } from './dynamic-io.directive';

const getComponentInjectorFrom = getByPredicate<ComponentInjectorComponent>(
  By.directive(ComponentInjectorComponent),
);
const getInjectedComponentFrom = getByPredicate<InjectedComponent>(
  By.directive(InjectedComponent),
);
const getInjectedBoundComponentFrom = getByPredicate<InjectedBoundComponent>(
  By.directive(InjectedBoundComponent),
);

describe('Directive: DynamicIo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        ComponentInjectorComponent,
        DynamicIoDirective,
        ComponentOutletInjectorDirective,
      ],
      providers: [
        {
          provide: DynamicComponentInjectorToken,
          useExisting: ComponentInjectorComponent,
        },
      ],
    });
  });

  describe('inputs', () => {
    let fixture: ComponentFixture<TestComponent>;
    let injectorComp: ComponentInjectorComponent;
    let injectedComp: MockedInjectedComponent;

    beforeEach(
      waitForAsync(() => {
        const template = `<component-injector [ndcDynamicInputs]="inputs"></component-injector>`;
        TestBed.overrideComponent(TestComponent, { set: { template } });
        fixture = TestBed.createComponent(TestComponent);
        injectorComp = getComponentInjectorFrom(fixture).component;
        injectedComp = injectorComp.component;

        fixture.componentInstance['inputs'] = { prop1: 'prop1', prop2: 2 };
      }),
    );

    it('should be passed to component', () => {
      fixture.detectChanges();

      expect(injectedComp['prop1']).toBe('prop1');
      expect(injectedComp['prop2']).toBe(2);
    });

    it('should be reassigned when replaced', () => {
      fixture.detectChanges();
      fixture.componentInstance['inputs'] = { otherProp: 'set' };
      fixture.detectChanges();

      expect(injectedComp['otherProp']).toBe('set');
    });

    it('should be reassigned from `null|undefined` when replaced', () => {
      fixture.componentInstance['inputs'] = null;
      fixture.detectChanges();
      fixture.componentInstance['inputs'] = { otherProp: 'set' };
      fixture.detectChanges();

      expect(injectedComp['otherProp']).toBe('set');
    });

    it('should trigger initially `OnChanges` life-cycle hook', () => {
      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);
      expect(injectedComp.ngOnChanges).toHaveBeenCalledWith({
        prop1: new SimpleChange(undefined, 'prop1', true),
        prop2: new SimpleChange(undefined, 2, true),
      });
    });

    it('should trigger markForCheck of component`s `ChangeDetectorRef`', () => {
      const cdr = { markForCheck: jest.fn() };
      injectorComp.injectorGet.mockReturnValue(cdr);

      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);
      expect(injectorComp.injectorGet).toHaveBeenCalledWith(ChangeDetectorRef);
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should trigger `OnChanges` life-cycle hook on updates', () => {
      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);
      injectedComp.ngOnChanges.mockReset();

      fixture.componentInstance['inputs'].prop1 = '123';
      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);
      expect(injectedComp.ngOnChanges).toHaveBeenCalledWith({
        prop1: new SimpleChange('prop1', '123', false),
      });
    });

    it('should trigger `OnChanges` life-cycle hook if component instance was updated', () => {
      injectedComp.ngOnChanges.mockImplementation((changes: SimpleChanges) => {
        expect(changes.prop1).toBeDefined();
        expect(changes.prop1.currentValue).toBe('prop1');
        expect(changes.prop1.isFirstChange()).toBeTruthy();
        expect(changes.prop2).toBeDefined();
        expect(changes.prop2.currentValue).toBe(2);
        expect(changes.prop2.isFirstChange()).toBeTruthy();
      });

      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);

      const newInjectedComp = (injectorComp.component = Object.assign(
        {},
        injectorComp.component,
      ));
      fixture.detectChanges();

      expect(newInjectedComp.ngOnChanges).toHaveBeenCalledTimes(2);
    });

    it('should NOT trigger `OnChanges` hook if not available on dynamic component', () => {
      delete injectedComp.ngOnChanges;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should NOT throw exception if inputs undefined', () => {
      fixture.componentInstance['inputs'] = undefined;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should NOT throw exception if inputs null', () => {
      fixture.componentInstance['inputs'] = null;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should NOT throw exception when same inputs are reassigned with new object', () => {
      fixture.detectChanges();
      fixture.componentInstance['inputs'] = {
        ...fixture.componentInstance['inputs'],
      };
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should NOT throw if component injector is null', () => {
      injectorComp.component = null;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should call `ngOnChanges` once when inputs and component updated', () => {
      fixture.detectChanges();
      injectorComp.component.ngOnChanges.mockReset();

      const inputs = fixture.componentInstance['inputs'];
      fixture.componentInstance['inputs'] = { ...inputs, prop: 'any' };
      const newInjectedComp = (injectorComp.component = {
        ...injectorComp.component,
      });

      newInjectedComp.ngOnChanges.mockImplementation(
        (changes: SimpleChanges) => {
          expect(changes.prop).toBeDefined();
          expect(changes.prop.currentValue).toBe('any');
          expect(changes.prop.previousValue).toBeUndefined();
          expect(changes.prop.isFirstChange()).toBeTruthy();

          expect(changes.prop1).toBeDefined();
          expect(changes.prop1.currentValue).toBe('prop1');
          expect(changes.prop1.previousValue).toBeUndefined();
          expect(changes.prop1.isFirstChange()).toBeTruthy();
        },
      );

      fixture.detectChanges();

      expect(newInjectedComp.ngOnChanges).toHaveBeenCalledTimes(1);
    });
  });

  describe('inputs with `NgComponentOutlet`', () => {
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
          declarations: [DynamicIoDirective, TestComponent],
        });

        const template = `<ng-container [ngComponentOutlet]="comp" [ndcDynamicInputs]="inputs"></ng-container>`;
        TestBed.overrideComponent(TestComponent, { set: { template } });
        fixture = TestBed.createComponent(TestComponent);

        fixture.componentInstance['inputs'] = { prop1: '123', prop2: 1 };
        fixture.componentInstance['comp'] = InjectedComponent;
      }),
    );

    it('should be passed to dynamic component instance', () => {
      fixture.detectChanges();

      const injectedComp = getInjectedComponentFrom(fixture).component;

      expect(injectedComp['prop1']).toBe('123');
      expect(injectedComp['prop2']).toBe(1);
    });
  });

  describe('inputs with `NgComponentOutlet` * syntax', () => {
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
          declarations: [DynamicIoDirective, TestComponent],
        });

        const template = `<ng-container *ngComponentOutlet="comp; ndcDynamicInputs: inputs"></ng-container>`;
        TestBed.overrideComponent(TestComponent, { set: { template } });
        fixture = TestBed.createComponent(TestComponent);

        fixture.componentInstance['inputs'] = { prop1: '123', prop2: 1 };
        fixture.componentInstance['comp'] = InjectedComponent;
      }),
    );

    it('should be passed to dynamic component instance', () => {
      fixture.detectChanges();

      const injectedComp = getInjectedComponentFrom(fixture).component;

      expect(injectedComp['prop1']).toBe('123');
      expect(injectedComp['prop2']).toBe(1);
    });
  });

  describe('bound inputs', () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComp: any;
    let injectedComp: InjectedBoundComponent;
    let onChangesMock: jest.Mock;

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
          declarations: [DynamicIoDirective, TestComponent],
        });

        const template = `<ng-container [ngComponentOutlet]="comp" [ndcDynamicInputs]="inputs"></ng-container>`;
        TestBed.overrideComponent(TestComponent, {
          set: { template },
        }).compileComponents();
        fixture = TestBed.createComponent(TestComponent);

        testComp = fixture.componentInstance;
        testComp.comp = InjectedBoundComponent;
        testComp.inputs = null;

        fixture.detectChanges();
        injectedComp = getInjectedBoundComponentFrom(fixture).component;
        injectedComp['ngOnChanges'] = onChangesMock = jest.fn();
      }),
    );

    it('should correctly be passed to dynamic component', () => {
      testComp.inputs = { outerProp: '123' };
      fixture.detectChanges();

      expect(injectedComp.innerProp).toBe('123');
    });

    it('should trigger `OnChanges` life-cycle hook with correct names', () => {
      onChangesMock.mockImplementation((changes: SimpleChanges) => {
        expect(changes.innerProp).toBeDefined();
        expect(changes.innerProp.currentValue).toBe('123');
        expect(changes.innerProp.isFirstChange()).toBeTruthy();
      });

      testComp.inputs = { outerProp: '123' };
      fixture.detectChanges();

      expect(onChangesMock).toHaveBeenCalledTimes(1);

      onChangesMock.mockImplementation((changes: SimpleChanges) => {
        expect(changes.innerProp).toBeDefined();
        expect(changes.innerProp.currentValue).toBe('456');
        expect(changes.innerProp.previousValue).toBe('123');
        expect(changes.innerProp.isFirstChange()).toBeFalsy();
      });

      testComp.inputs = { outerProp: '456' };
      fixture.detectChanges();

      expect(onChangesMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('outputs', () => {
    let fixture: ComponentFixture<TestComponent>;
    let injectorComp: ComponentInjectorComponent;
    let injectedComp: MockedInjectedComponent;
    let outputSpy: jest.Mock;

    beforeEach(
      waitForAsync(() => {
        const template = `<component-injector [ndcDynamicOutputs]="outputs"></component-injector>`;
        TestBed.overrideComponent(TestComponent, { set: { template } });
        fixture = TestBed.createComponent(TestComponent);
        injectorComp = getComponentInjectorFrom(fixture).component;
        injectedComp = injectorComp.component;
        outputSpy = jest.fn();

        fixture.componentInstance['outputs'] = { onEvent: outputSpy };
      }),
    );

    it(
      'should bind outputs to component and receive events',
      waitForAsync(() => {
        fixture.detectChanges();

        injectedComp.onEvent.next('data');

        expect(outputSpy).toHaveBeenCalledTimes(1);
        expect(outputSpy).toHaveBeenCalledWith('data');
      }),
    );

    it(
      'should re-bind outputs after `null|undefined` to component and receive events',
      waitForAsync(() => {
        fixture.componentInstance['outputs'] = null;
        fixture.detectChanges();
        fixture.componentInstance['outputs'] = { onEvent: outputSpy };
        fixture.detectChanges();

        injectedComp.onEvent.next('data');

        expect(outputSpy).toHaveBeenCalledTimes(1);
        expect(outputSpy).toHaveBeenCalledWith('data');
      }),
    );

    it(
      'should NOT bind outputs to component when outputs undefined',
      waitForAsync(() => {
        fixture.componentInstance['outputs'] = undefined;

        expect(() => fixture.detectChanges()).not.toThrow();

        injectedComp.onEvent.next('data');

        expect(outputSpy).not.toHaveBeenCalled();
      }),
    );

    it(
      'should NOT bind outputs to component when outputs null',
      waitForAsync(() => {
        fixture.componentInstance['outputs'] = null;

        expect(() => fixture.detectChanges()).not.toThrow();

        injectedComp.onEvent.next('data');

        expect(outputSpy).not.toHaveBeenCalled();
      }),
    );

    it('should unbind outputs when component destroys', () => {
      const tearDownFn = jest.fn();

      injectedComp.onEvent = new Observable(_ => tearDownFn) as any;

      fixture.detectChanges();

      injectorComp.component = null;
      fixture.detectChanges();

      expect(tearDownFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('outputs with template arguments', () => {
    let fixture: ComponentFixture<TestComponent>;
    let injectorComp: ComponentInjectorComponent;
    let injectedComp: MockedInjectedComponent;
    let outputSpy: jest.Mock;

    const init = (template: string) => {
      TestBed.overrideTemplate(TestComponent, template);
      fixture = TestBed.createComponent(TestComponent);
      injectorComp = getComponentInjectorFrom(fixture).component;
      injectedComp = injectorComp.component;
      outputSpy = jest.fn();

      fixture.componentInstance['outputSpy'] = outputSpy;
    };

    it('should bind outputs with event without specifying template arguments', () => {
      init(
        `<component-injector
          [ndcDynamicOutputs]="{ onEvent: { handler: outputSpy } }"
          ></component-injector>`,
      );
      fixture.detectChanges();

      injectedComp.onEvent.next('data');

      expect(outputSpy).toHaveBeenCalledWith('data');
    });

    it('should bind outputs without event when set to null/undefined', () => {
      init(
        `<component-injector
          [ndcDynamicOutputs]="{ onEvent: { handler: outputSpy, args: null } }"
          ></component-injector>`,
      );
      fixture.detectChanges();

      injectedComp.onEvent.next('data');

      expect(outputSpy).toHaveBeenCalledWith();
    });

    it('should bind outputs with event and template arguments', () => {
      init(
        `<component-injector
          [ndcDynamicOutputs]="{ onEvent: { handler: outputSpy, args: ['$event', tplVar] } }"
          ></component-injector>`,
      );
      fixture.componentInstance['tplVar'] = 'from-template';
      fixture.detectChanges();

      injectedComp.onEvent.next('data');

      expect(outputSpy).toHaveBeenCalledWith('data', 'from-template');
    });

    it('should bind outputs with updated template arguments', () => {
      init(
        `<component-injector
          [ndcDynamicOutputs]="{ onEvent: { handler: outputSpy, args: ['$event', tplVar] } }"
          ></component-injector>`,
      );
      fixture.componentInstance['tplVar'] = 'from-template';
      fixture.detectChanges();
      injectedComp.onEvent.next('data');

      expect(outputSpy).toHaveBeenCalledWith('data', 'from-template');

      fixture.componentInstance['tplVar'] = 'new-value';
      fixture.detectChanges();
      injectedComp.onEvent.next('new-data');

      expect(outputSpy).toHaveBeenCalledWith('new-data', 'new-value');
    });

    it('should bind outputs with custom event ID', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: EventArgumentToken, useValue: '$e' }],
      });
      init(
        `<component-injector
          [ndcDynamicOutputs]="{ onEvent: { handler: outputSpy, args: ['$e', tplVar] } }"
          ></component-injector>`,
      );
      fixture.componentInstance['tplVar'] = 'from-template';
      fixture.detectChanges();

      injectedComp.onEvent.next('data');

      expect(outputSpy).toHaveBeenCalledWith('data', 'from-template');
    });
  });

  describe('outputs with `NgComponentOutlet`', () => {
    let fixture: ComponentFixture<TestComponent>;
    let outputSpy: jest.Mock;

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
          declarations: [DynamicIoDirective, TestComponent],
        });

        const template = `<ng-container [ngComponentOutlet]="comp" [ndcDynamicOutputs]="outputs"></ng-container>`;
        TestBed.overrideComponent(TestComponent, { set: { template } });
        fixture = TestBed.createComponent(TestComponent);

        outputSpy = jest.fn();

        InjectedComponent.prototype['onEvent'] = new Subject<any>();

        fixture.componentInstance['outputs'] = { onEvent: outputSpy };
        fixture.componentInstance['comp'] = InjectedComponent;
      }),
    );

    afterEach(() => delete InjectedComponent.prototype['onEvent']);

    it('should be passed to dynamic component instance', () => {
      fixture.detectChanges();

      const injectedComp = getInjectedComponentFrom(fixture).component;

      injectedComp['onEvent'].next('data');

      expect(outputSpy).toHaveBeenCalledTimes(1);
      expect(outputSpy).toHaveBeenCalledWith('data');
    });
  });

  describe('outputs with `NgComponentOutlet` * syntax', () => {
    let fixture: ComponentFixture<TestComponent>;
    let outputSpy: jest.Mock;

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
          declarations: [DynamicIoDirective, TestComponent],
        });

        const template = `<ng-container *ngComponentOutlet="comp; ndcDynamicOutputs: outputs"></ng-container>`;
        TestBed.overrideComponent(TestComponent, { set: { template } });
        fixture = TestBed.createComponent(TestComponent);

        outputSpy = jest.fn();

        InjectedComponent.prototype['onEvent'] = new Subject<any>();

        fixture.componentInstance['outputs'] = { onEvent: outputSpy };
        fixture.componentInstance['comp'] = InjectedComponent;
      }),
    );

    afterEach(() => delete InjectedComponent.prototype['onEvent']);

    it('should be passed to dynamic component instance', () => {
      fixture.detectChanges();

      const injectedComp = getInjectedComponentFrom(fixture).component;

      injectedComp['onEvent'].next('data');

      expect(outputSpy).toHaveBeenCalledTimes(1);
      expect(outputSpy).toHaveBeenCalledWith('data');
    });
  });

  describe('bound outputs', () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComp: any;
    let injectedComp: InjectedBoundComponent;
    let outputHandler: jest.Mock;

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
          declarations: [DynamicIoDirective, TestComponent],
        });

        const template = `<ng-container [ngComponentOutlet]="comp" [ndcDynamicOutputs]="outputs"></ng-container>`;
        TestBed.overrideComponent(TestComponent, {
          set: { template },
        }).compileComponents();
        fixture = TestBed.createComponent(TestComponent);

        testComp = fixture.componentInstance;
        testComp.comp = InjectedBoundComponent;
        testComp.outputs = null;

        fixture.detectChanges();
        injectedComp = getInjectedBoundComponentFrom(fixture).component;

        outputHandler = jest.fn();
      }),
    );

    it('should correctly be passed to dynamic component', () => {
      testComp.outputs = { outerEvt: outputHandler };
      fixture.detectChanges();

      injectedComp.innerEvt.emit('data');

      expect(outputHandler).toHaveBeenCalledTimes(1);
      expect(outputHandler).toHaveBeenCalledWith('data');
    });
  });

  describe('outputs with OnPush', () => {
    function testOnPush(withArgs: boolean) {
      const template = `<span [class]="value"></span><component-injector [ndcDynamicOutputs]="outputs"></component-injector>`;
      TestBed.overrideComponent(TestComponent, {
        set: { template, changeDetection: ChangeDetectionStrategy.OnPush },
      });
      const fixture = TestBed.createComponent(TestComponent);
      const injectorComp = getComponentInjectorFrom(fixture).component;
      const injectedComp = injectorComp.component;

      const eventHandler = (v: string) =>
        ((fixture.componentInstance as any).value = v);
      fixture.componentInstance['outputs'] = {
        onEvent: withArgs ? { handler: eventHandler } : eventHandler,
      };
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.foo')).toBeFalsy();
      injectedComp.onEvent.emit('foo');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.foo')).toBeTruthy();
    }

    it('should mark host component for check when calling event handler', () => {
      testOnPush(false);
    });

    it('should mark host component for check when calling output with args', () => {
      testOnPush(true);
    });
  });
});
