import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';

import {
  ComponentInjectorComponent,
  getByPredicate,
  InjectedComponent,
  MockedInjectedComponent,
  TestComponent,
  InjectedBoundComponent,
  TestModule,
} from '../test/index';
import { COMPONENT_INJECTOR } from './component-injector';
import { DynamicDirective } from './dynamic.directive';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';

const getComponentInjectorFrom = getByPredicate<ComponentInjectorComponent>(
  By.directive(ComponentInjectorComponent),
);
const getInjectedComponentFrom = getByPredicate<InjectedComponent>(
  By.directive(InjectedComponent),
);
const getInjectedBoundComponentFrom = getByPredicate<InjectedBoundComponent>(
  By.directive(InjectedBoundComponent),
);

describe('Directive: Dynamic', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        ComponentInjectorComponent,
        DynamicDirective,
        ComponentOutletInjectorDirective,
      ],
      providers: [
        { provide: COMPONENT_INJECTOR, useValue: ComponentInjectorComponent },
      ],
    });
  });

  describe('inputs', () => {
    let fixture: ComponentFixture<TestComponent>,
      injectorComp: ComponentInjectorComponent,
      injectedComp: MockedInjectedComponent;

    beforeEach(async(() => {
      const template = `<component-injector [ndcDynamicInputs]="inputs"></component-injector>`;
      TestBed.overrideComponent(TestComponent, { set: { template } });
      fixture = TestBed.createComponent(TestComponent);
      injectorComp = getComponentInjectorFrom(fixture).component;
      injectedComp = injectorComp.component;

      fixture.componentInstance['inputs'] = { prop1: 'prop1', prop2: 2 };
    }));

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
    });

    it('should trigger `OnChanges` life-cycle hook on updates', () => {
      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);

      injectedComp.ngOnChanges.mockImplementation((changes: SimpleChanges) => {
        expect(changes.prop1).toBeDefined();
        expect(changes.prop1.currentValue).toBe('123');
        expect(changes.prop1.isFirstChange()).toBeFalsy();
        expect(changes.prop2).toBeDefined();
        expect(changes.prop2.currentValue).toBe(2);
        expect(changes.prop2.isFirstChange()).toBeFalsy();
      });

      fixture.componentInstance['inputs'].prop1 = '123';
      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(2);
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

      let newInjectedComp = (injectorComp.component = Object.assign(
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

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [DynamicDirective, TestComponent],
      });

      const template = `<ng-container [ngComponentOutlet]="comp" [ndcDynamicInputs]="inputs"></ng-container>`;
      TestBed.overrideComponent(TestComponent, { set: { template } });
      fixture = TestBed.createComponent(TestComponent);

      fixture.componentInstance['inputs'] = { prop1: '123', prop2: 1 };
      fixture.componentInstance['comp'] = InjectedComponent;
    }));

    it('should be passed to dynamic component instance', () => {
      fixture.detectChanges();

      const injectedComp = getInjectedComponentFrom(fixture).component;

      expect(injectedComp['prop1']).toBe('123');
      expect(injectedComp['prop2']).toBe(1);
    });
  });

  describe('inputs with `NgComponentOutlet` * syntax', () => {
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [DynamicDirective, TestComponent],
      });

      const template = `<ng-container *ngComponentOutlet="comp; ndcDynamicInputs: inputs"></ng-container>`;
      TestBed.overrideComponent(TestComponent, { set: { template } });
      fixture = TestBed.createComponent(TestComponent);

      fixture.componentInstance['inputs'] = { prop1: '123', prop2: 1 };
      fixture.componentInstance['comp'] = InjectedComponent;
    }));

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

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [DynamicDirective, TestComponent],
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
    }));

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
    let fixture: ComponentFixture<TestComponent>,
      injectorComp: ComponentInjectorComponent,
      injectedComp: MockedInjectedComponent,
      outputSpy: jasmine.Spy;

    beforeEach(async(() => {
      const template = `<component-injector [ndcDynamicOutputs]="outputs"></component-injector>`;
      TestBed.overrideComponent(TestComponent, { set: { template } });
      fixture = TestBed.createComponent(TestComponent);
      injectorComp = getComponentInjectorFrom(fixture).component;
      injectedComp = injectorComp.component;
      outputSpy = jasmine.createSpy('outputSpy');

      fixture.componentInstance['outputs'] = { onEvent: outputSpy };
    }));

    it('should bind outputs to component and receive events', async(() => {
      fixture.detectChanges();

      injectedComp.onEvent.next('data');

      expect(outputSpy).toHaveBeenCalledTimes(1);
      expect(outputSpy).toHaveBeenCalledWith('data');
    }));

    it('should re-bind outputs after `null|undefiined` to component and receive events', async(() => {
      fixture.componentInstance['outputs'] = null;
      fixture.detectChanges();
      fixture.componentInstance['outputs'] = { onEvent: outputSpy };
      fixture.detectChanges();

      injectedComp.onEvent.next('data');

      expect(outputSpy).toHaveBeenCalledTimes(1);
      expect(outputSpy).toHaveBeenCalledWith('data');
    }));

    it('should NOT bind outputs to component when outputs undefined', async(() => {
      fixture.componentInstance['outputs'] = undefined;

      expect(() => fixture.detectChanges()).not.toThrow();

      injectedComp.onEvent.next('data');

      expect(outputSpy).not.toHaveBeenCalled();
    }));

    it('should NOT bind outputs to component when outputs null', async(() => {
      fixture.componentInstance['outputs'] = null;

      expect(() => fixture.detectChanges()).not.toThrow();

      injectedComp.onEvent.next('data');

      expect(outputSpy).not.toHaveBeenCalled();
    }));

    it('should unbind outputs when component destroys', () => {
      const tearDownFn = jasmine.createSpy('tearDownFn');

      injectedComp.onEvent = new Observable(_ => tearDownFn) as any;

      fixture.detectChanges();

      injectorComp.component = null;
      fixture.detectChanges();

      expect(tearDownFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('outputs with `NgComponentOutlet`', () => {
    let fixture: ComponentFixture<TestComponent>, outputSpy: jasmine.Spy;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [DynamicDirective, TestComponent],
      });

      const template = `<ng-container [ngComponentOutlet]="comp" [ndcDynamicOutputs]="outputs"></ng-container>`;
      TestBed.overrideComponent(TestComponent, { set: { template } });
      fixture = TestBed.createComponent(TestComponent);

      outputSpy = jasmine.createSpy('outputSpy');

      InjectedComponent.prototype['onEvent'] = new Subject<any>();

      fixture.componentInstance['outputs'] = { onEvent: outputSpy };
      fixture.componentInstance['comp'] = InjectedComponent;
    }));

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
    let fixture: ComponentFixture<TestComponent>, outputSpy: jasmine.Spy;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [DynamicDirective, TestComponent],
      });

      const template = `<ng-container *ngComponentOutlet="comp; ndcDynamicOutputs: outputs"></ng-container>`;
      TestBed.overrideComponent(TestComponent, { set: { template } });
      fixture = TestBed.createComponent(TestComponent);

      outputSpy = jasmine.createSpy('outputSpy');

      InjectedComponent.prototype['onEvent'] = new Subject<any>();

      fixture.componentInstance['outputs'] = { onEvent: outputSpy };
      fixture.componentInstance['comp'] = InjectedComponent;
    }));

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

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [DynamicDirective, TestComponent],
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
    }));

    it('should correctly be passed to dynamic component', () => {
      testComp.outputs = { outerEvt: outputHandler };
      fixture.detectChanges();

      injectedComp.innerEvt.emit('data');

      expect(outputHandler).toHaveBeenCalledTimes(1);
      expect(outputHandler).toHaveBeenCalledWith('data');
    });
  });
});
