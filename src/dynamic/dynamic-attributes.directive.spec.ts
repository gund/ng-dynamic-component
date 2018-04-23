import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  InjectedComponent,
  TestComponent as TestComponentBase,
  TestModule,
} from '../test/test.component';
import { getByPredicate } from '../test/util';
import { COMPONENT_INJECTOR } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { DynamicAttributesDirective } from './dynamic-attributes.directive';
import { DynamicComponent } from './dynamic.component';

const getInjectedComponentFrom = getByPredicate<InjectedComponent>(
  By.directive(InjectedComponent),
);

@Component({})
class TestComponent extends TestComponentBase {
  comp = InjectedComponent;
  attrs: { [k: string]: string };
}

describe('DynamicAttributesDirective', () => {
  let hostTemplate = '';
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TestModule],
      declarations: [
        DynamicAttributesDirective,
        TestComponent,
        ComponentOutletInjectorDirective,
        DynamicComponent,
      ],
      providers: [{ provide: COMPONENT_INJECTOR, useValue: DynamicComponent }],
    })
      .overrideTemplate(TestComponent, hostTemplate)
      .compileComponents();

    fixture = TestBed.createComponent(TestComponent);
  }));

  describe('with `ngComponentOutlet`', () => {
    beforeAll(() =>
      (hostTemplate = `<ng-container [ngComponentOutlet]="comp" [ndcDynamicAttributes]="attrs"></ng-container>`));

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
  });

  describe('with `ndc-dynamic`', () => {
    beforeAll(() =>
      (hostTemplate = `<ndc-dynamic [ndcDynamicComponent]="comp" [ndcDynamicAttributes]="attrs"></ndc-dynamic>`));

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
});
