import { ComponentInjectorComponent, getByPredicate, MokedInjectedComponent, TestComponent } from '../test/index';
import { COMPONENT_INJECTOR } from './component-injector';
import { DynamicDirective } from './dynamic.directive';
import { NgComponentOutlet } from '@angular/common';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';

const getComponentInjectorFrom = getByPredicate<ComponentInjectorComponent>(By.directive(ComponentInjectorComponent));

describe('Directive: Dynamic', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, ComponentInjectorComponent, DynamicDirective],
      providers: [{ provide: COMPONENT_INJECTOR, useValue: ComponentInjectorComponent }]
    });
  });

  describe('inputs', () => {
    let fixture: ComponentFixture<TestComponent>
      , injectorComp: ComponentInjectorComponent
      , injectedComp: MokedInjectedComponent;

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

    it('should trigger initially `OnChanges` life-cycle hook', () => {
      injectedComp.ngOnChanges.and.callFake((changes: SimpleChanges) => {
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

      injectedComp.ngOnChanges.and.callFake((changes: SimpleChanges) => {
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
      injectedComp.ngOnChanges.and.callFake((changes: SimpleChanges) => {
        expect(changes.prop1).toBeDefined();
        expect(changes.prop1.currentValue).toBe('prop1');
        expect(changes.prop1.isFirstChange()).toBeTruthy();
        expect(changes.prop2).toBeDefined();
        expect(changes.prop2.currentValue).toBe(2);
        expect(changes.prop2.isFirstChange()).toBeTruthy();
      });

      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);

      let newInjectedComp = injectorComp.component = Object.assign({}, injectorComp.component);
      fixture.detectChanges();

      expect(newInjectedComp.ngOnChanges).toHaveBeenCalledTimes(2);
    });

    it('should NOT trigger `OnChanges` hook if not available on dynamic component', () => {
      delete injectedComp.ngOnChanges;
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('inputs with `NgComponentOutlet`', () => {
    let fixture: ComponentFixture<ComponentInjectorComponent>
      , injectedComp: MokedInjectedComponent;

    beforeEach(async(() => {
      injectedComp = new MokedInjectedComponent();

      TestBed.configureTestingModule({
        declarations: [TestComponent, DynamicDirective],
        providers: [
          { provide: NgComponentOutlet, useValue: { _componentRef: injectedComp } }
        ]
      });

      const template = `<ng-template [ndcDynamicInputs]="inputs"></ng-template>`;
      TestBed.overrideComponent(ComponentInjectorComponent, { set: { template } });
      fixture = TestBed.createComponent(ComponentInjectorComponent);

      fixture.componentInstance['inputs'] = { prop1: '123', prop2: 1 };
    }));

    it('should be passed to dynamic component instance', () => {
      fixture.detectChanges();

      expect(injectedComp['prop1']).toBe('123');
      expect(injectedComp['prop2']).toBe(1);
    });
  });

  describe('outputs', () => {
    let fixture: ComponentFixture<TestComponent>
      , injectorComp: ComponentInjectorComponent
      , injectedComp: MokedInjectedComponent
      , outputSpy: jasmine.Spy;

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

    it('should unbind outputs when component destroys', () => {
      const tearDownFn = jasmine.createSpy('tearDownFn');

      injectedComp.onEvent = new Observable(_ => tearDownFn) as any;

      fixture.detectChanges();

      injectorComp.component = null;
      fixture.detectChanges();

      expect(tearDownFn).toHaveBeenCalledTimes(1);
    });
  });
});
