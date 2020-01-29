import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  AnotherInjectedComponent,
  InjectedComponent,
  TestComponent as TestComponentBase,
  TestModule,
  getByPredicate,
} from '../test';
import { COMPONENT_INJECTOR } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import {
  AttributesMap,
  DynamicAttributesDirective,
} from './dynamic-attributes.directive';
import { DynamicComponent } from './dynamic.component';

const getInjectedComponentFrom = getByPredicate<InjectedComponent>(
  By.directive(InjectedComponent),
);
const getAnotherInjectedComponentFrom = getByPredicate<
  AnotherInjectedComponent
>(By.directive(AnotherInjectedComponent));

describe('DynamicAttributesDirective', () => {
  describe('with `ngComponentOutlet`', () => {
    let fixture: ComponentFixture<TestComponent>;

    @Component({
      template: `
        <ng-container
          [ngComponentOutlet]="comp"
          [ndcDynamicAttributes]="attrs"
        ></ng-container>
      `,
    })
    class TestComponent extends TestComponentBase {
      comp = InjectedComponent;
      attrs: AttributesMap;
    }

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, TestModule],
        declarations: [
          DynamicAttributesDirective,
          TestComponent,
          ComponentOutletInjectorDirective,
        ],
        providers: [
          { provide: COMPONENT_INJECTOR, useValue: DynamicComponent },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TestComponent);
    }));

    it('should set attrs on injected component', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;

      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toMatchObject(attrs);
    });

    it('should not do anything if attrs are not defined', () => {
      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toEqual({});
    });

    it('should set attrs if they were not set initially', () => {
      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toEqual({});

      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;

      fixture.detectChanges();

      expect(injectedElem.attributes).toMatchObject(attrs);
    });

    it('should replace attrs if new object set', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;
      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toEqual(attrs);

      const attrs2 = {
        val3: 'new',
      };
      fixture.componentInstance.attrs = attrs2;

      fixture.detectChanges();

      expect(injectedElem.attributes).toMatchObject(attrs2);
    });

    it('should unset attrs if set to null/undefined', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;
      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toEqual(attrs);

      fixture.componentInstance.attrs = null;

      fixture.detectChanges();

      // Angular renderer sets removed attrs to null
      Object.keys(attrs).forEach(k => (attrs[k] = null));
      expect(injectedElem.attributes).toEqual(attrs);
    });

    it('should add new attr if added to object', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      } as any;
      fixture.componentInstance.attrs = attrs;
      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toEqual(attrs);

      attrs.val3 = 'new';
      fixture.detectChanges();

      expect(injectedElem.attributes).toEqual(attrs);
    });

    it('should remove attr if removed from object', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;
      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toEqual(attrs);

      delete attrs.attrTwo;
      fixture.detectChanges();

      // Angular renderer sets removed attrs to null
      attrs.attrTwo = null;
      expect(injectedElem.attributes).toEqual(attrs);
    });

    it('should update attr if updated in object', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;
      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toEqual(attrs);

      attrs.attrTwo = 'new';
      fixture.detectChanges();

      expect(injectedElem.attributes).toEqual(attrs);
    });

    it('should reassign attrs when new component injected', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;

      fixture.detectChanges();

      fixture.componentInstance.comp = AnotherInjectedComponent;

      fixture.detectChanges();

      const injectedElem = getAnotherInjectedComponentFrom(fixture)
        .componentElem;

      expect(injectedElem.attributes).toMatchObject(attrs);
    });
  });

  describe('with `ngComponentOutlet` * syntax', () => {
    let fixture: ComponentFixture<TestComponent>;

    @Component({
      template: `
        <ng-container
          *ngComponentOutlet="comp; ndcDynamicAttributes: attrs"
        ></ng-container>
      `,
    })
    class TestComponent extends TestComponentBase {
      comp = InjectedComponent;
      attrs: AttributesMap;
    }

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, TestModule],
        declarations: [
          DynamicAttributesDirective,
          TestComponent,
          ComponentOutletInjectorDirective,
        ],
        providers: [
          { provide: COMPONENT_INJECTOR, useValue: DynamicComponent },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TestComponent);
    }));

    it('should set attributes on injected component', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;

      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toMatchObject(attrs);
    });
  });

  describe('with `ndc-dynamic`', () => {
    let fixture: ComponentFixture<TestComponent>;

    @Component({
      // tslint:disable-next-line: component-selector
      selector: 'host-comp',
      template: `
        <ndc-dynamic
          [ndcDynamicComponent]="comp"
          [ndcDynamicAttributes]="attrs"
        ></ndc-dynamic>
      `,
    })
    class TestComponent {
      @ViewChild(DynamicComponent, { static: false })
      dynamicComp: DynamicComponent;
      comp = InjectedComponent;
      attrs: AttributesMap;
    }

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, TestModule],
        declarations: [
          DynamicComponent,
          DynamicAttributesDirective,
          TestComponent,
        ],
        providers: [
          { provide: COMPONENT_INJECTOR, useValue: DynamicComponent },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TestComponent);
    }));

    it('should set attributes on injected component', () => {
      const attrs = {
        'attr-one': 'val-1',
        attrTwo: 'val-two',
      };
      fixture.componentInstance.attrs = attrs;

      fixture.detectChanges();

      const injectedElem = getInjectedComponentFrom(fixture).componentElem;

      expect(injectedElem.attributes).toMatchObject(attrs);
    });
  });

  describe('without dynamic component', () => {
    let fixture: ComponentFixture<TestComponent>;

    @Component({
      template: `
        <div [ngComponentOutlet]="comp" [ndcDynamicAttributes]="attrs"></div>
      `,
    })
    class TestComponent extends TestComponentBase {
      comp: any;
      attrs: AttributesMap;
    }

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule],
        declarations: [
          DynamicAttributesDirective,
          TestComponent,
          ComponentOutletInjectorDirective,
        ],
        providers: [
          { provide: COMPONENT_INJECTOR, useValue: DynamicComponent },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TestComponent);
    }));

    it('should not do anything', () => {
      fixture.componentInstance.attrs = { 'my-attr': 'val' };

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    describe('setAttribute() method', () => {
      it('should not do anything', () => {
        fixture.detectChanges();

        const dynamicElem = fixture.debugElement.query(
          By.directive(DynamicAttributesDirective),
        );

        expect(dynamicElem).toBeTruthy();

        const dynamicAttrDir = dynamicElem.injector.get(
          DynamicAttributesDirective,
        );

        expect(() =>
          dynamicAttrDir.setAttribute('my-att', 'val'),
        ).not.toThrow();
      });
    });

    describe('removeAttribute() method', () => {
      it('should not do anything', () => {
        fixture.detectChanges();

        const dynamicElem = fixture.debugElement.query(
          By.directive(DynamicAttributesDirective),
        );

        expect(dynamicElem).toBeTruthy();

        const dynamicAttrDir = dynamicElem.injector.get(
          DynamicAttributesDirective,
        );

        expect(() => dynamicAttrDir.removeAttribute('my-att')).not.toThrow();
      });
    });
  });
});
