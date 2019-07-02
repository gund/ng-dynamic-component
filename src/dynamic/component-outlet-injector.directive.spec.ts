import { CommonModule } from '@angular/common';
import { Component, ComponentRef, Type, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
  InjectedComponent,
  TestComponent as TestComponentBase,
  TestModule,
} from '../test/test.component';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';

@Component({
  template: `
    <ng-container *ngComponentOutlet="comp"></ng-container>
  `,
})
class TestComponent extends TestComponentBase {
  @ViewChild(ComponentOutletInjectorDirective, { static: false })
  directive: ComponentOutletInjectorDirective;
  comp: Type<any>;
}

describe('ComponentOutletInjectorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: ComponentOutletInjectorDirective;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TestModule],
      declarations: [ComponentOutletInjectorDirective, TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.comp = InjectedComponent;
    fixture.detectChanges();
    directive = fixture.componentInstance.directive;
  }));

  it('should be bound to `[ngComponentOutlet]` directive', () => {
    expect(directive).toBeInstanceOf(ComponentOutletInjectorDirective);
  });

  it('should return injected `componentRef` in `componentRef` prop', () => {
    expect(directive.componentRef).toBeInstanceOf(ComponentRef);
  });

  it('should hold instance of injected component in `componentRef`', () => {
    expect(directive.componentRef.instance).toBeInstanceOf(InjectedComponent);
  });
});
