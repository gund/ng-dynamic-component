import { ComponentInjectorComponent, getByPredicate, MokedInjectedComponent, TestComponent } from '../test/index';
import { COMPONENT_INJECTOR } from './component-injector';
import { DynamicDirective } from './dynamic.directive';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

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
    }));

    it('should be passed to component', () => {
      fixture.componentInstance['inputs'] = { prop1: 'prop1', prop2: 2 };
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

      fixture.componentInstance['inputs'] = { prop1: 'prop1', prop2: 2 };
      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);
    });

    it('should trigger `OnChanges` life-cycle hook on updates', () => {
      fixture.componentInstance['inputs'] = { prop1: 'prop1', prop2: 2 };
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

      fixture.componentInstance['inputs'] = { prop1: 'prop1', prop2: 2 };
      fixture.detectChanges();

      expect(injectedComp.ngOnChanges).toHaveBeenCalledTimes(1);

      let newInjectedComp = injectorComp.component = Object.assign({}, injectorComp.component);
      fixture.detectChanges();

      expect(newInjectedComp.ngOnChanges).toHaveBeenCalledTimes(2);
    });
  });
});
