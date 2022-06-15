import {
  Component,
  ComponentRef,
  InjectionToken,
  Injector,
  NO_ERRORS_SCHEMA,
  QueryList,
  StaticProvider,
  TemplateRef,
  Type,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  AnotherInjectedComponent,
  InjectedComponent,
  TestModule,
} from '../test';
import { DynamicComponent } from './dynamic.component';

/* eslint-disable @typescript-eslint/no-unused-vars */

const token = new InjectionToken<any>('TOKEN');
const tokenValue = {};

describe('DynamicComponent', () => {
  const testTemplate = `<ndc-dynamic [ndcDynamicComponent]="component"
                                   [ndcDynamicInjector]="injector"
                                   [ndcDynamicProviders]="providers"
                                   (ndcDynamicCreated)="createdComponent($event)"
                                   [ndcDynamicContent]="content"></ndc-dynamic>`;
  let fixture: ComponentFixture<TestComponent>;
  let createComp = true;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      declarations: [TestComponent, DynamicComponent],
    }).overrideComponent(TestComponent, { set: { template: testTemplate } });

    if (createComp) {
      fixture = TestBed.createComponent(TestComponent) as any;
    }
  }));

  describe('@Input(ndcDynamicComponent)', () => {
    it('should do nothing when input is not provided', () => {
      fixture.componentInstance.component = null;
      fixture.detectChanges();

      // Only ndc-dynamic rendered
      expect(fixture.debugElement.children.length).toBe(1);
    });

    it('should render component from input', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.detectChanges();

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(fixture.debugElement.children.length).toBe(2);
      expect(injectedElem).not.toBeNull();
      expect(injectedElem.componentInstance).toEqual(
        expect.any(InjectedComponent),
      );
    });

    it('should emit event (ndcDynamicCreated) when component created', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.detectChanges();

      expect(fixture.componentInstance.comp.instance).toBeInstanceOf(
        InjectedComponent,
      );
    });

    it('should clear view if input becomes null', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      fixture.componentInstance.component = null;
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(1);
    });

    it('should change component if input updated', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.detectChanges();

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(fixture.debugElement.children.length).toBe(2);
      expect(injectedElem).not.toBeNull();
      expect(injectedElem.componentInstance).toEqual(
        expect.any(InjectedComponent),
      );

      fixture.componentInstance.component = AnotherInjectedComponent;
      fixture.detectChanges();

      const anotherInjectedElem = fixture.debugElement.query(
        By.directive(AnotherInjectedComponent),
      );

      expect(fixture.debugElement.children.length).toBe(2);
      expect(anotherInjectedElem).not.toBeNull();
      expect(anotherInjectedElem.componentInstance).toEqual(
        expect.any(AnotherInjectedComponent),
      );
    });

    it('should keep component if input not changed', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      fixture.componentInstance.component = InjectedComponent;
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      const injectedElem2 = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(injectedElem.componentInstance).toBe(
        injectedElem2.componentInstance,
      );
    });
  });

  describe('@Input(ndcDynamicInjector)', () => {
    it('should use input if provided for injector', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.componentInstance.injector = Injector.create({
        providers: [{ provide: token, useValue: tokenValue }],
        parent: fixture.componentRef.injector,
      });
      fixture.detectChanges();

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(injectedElem.injector.get(token)).toBe(tokenValue);
    });

    it('should change component if input updated', () => {
      const anotherToken = new InjectionToken<any>('AnotherToken');
      const anotherTokenValue = {};

      fixture.componentInstance.component = InjectedComponent;
      fixture.componentInstance.injector = Injector.create({
        providers: [{ provide: token, useValue: tokenValue }],
        parent: fixture.componentRef.injector,
      });
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      fixture.componentInstance.injector = Injector.create({
        providers: [{ provide: anotherToken, useValue: anotherTokenValue }],
        parent: fixture.componentRef.injector,
      });
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      const injectedElem2 = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(injectedElem.componentInstance).not.toBe(
        injectedElem2.componentInstance,
      );
    });
  });

  describe('@Input(ndcDynamicProviders)', () => {
    it('should use input if provided for injector', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.componentInstance.providers = [
        { provide: token, useValue: tokenValue },
      ];
      fixture.detectChanges();

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(injectedElem.injector.get(token)).toBe(tokenValue);
    });

    it('should change component if input updated', () => {
      const anotherToken = new InjectionToken<any>('AnotherToken');
      const anotherTokenValue = {};

      fixture.componentInstance.component = InjectedComponent;
      fixture.componentInstance.providers = [
        { provide: token, useValue: tokenValue },
      ];
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      fixture.componentInstance.providers = [
        { provide: anotherToken, useValue: anotherTokenValue },
      ];
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      const injectedElem2 = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(injectedElem.componentInstance).not.toBe(
        injectedElem2.componentInstance,
      );
    });
  });

  it('should use both [ndcDynamicInjector] and [ndcDynamicProviders] if provided', () => {
    const anotherToken = new InjectionToken<any>('AnotherToken');
    const anotherTokenValue = {};

    fixture.componentInstance.component = InjectedComponent;
    fixture.componentInstance.injector = Injector.create({
      providers: [{ provide: token, useValue: tokenValue }],
      parent: fixture.componentRef.injector,
    });
    fixture.componentInstance.providers = [
      { provide: anotherToken, useValue: anotherTokenValue },
    ];
    fixture.detectChanges();

    const injectedElem = fixture.debugElement.query(
      By.directive(InjectedComponent),
    );

    expect(injectedElem.injector.get(token)).toEqual(tokenValue);
    expect(injectedElem.injector.get(anotherToken)).toEqual(anotherTokenValue);
  });

  describe('@Input(ndcDynamicContent)', () => {
    beforeAll(() => (createComp = false));
    afterAll(() => (createComp = true));

    beforeEach(() => {
      TestBed.overrideComponent(TestComponent, {
        set: {
          template: `
          <ng-template>projected text1</ng-template>
          <ng-template>projected text2</ng-template>
          ${testTemplate}`,
        },
      })
        .overrideComponent(InjectedComponent, {
          set: { template: `<ng-content></ng-content>` },
        })
        .configureTestingModule({ schemas: [NO_ERRORS_SCHEMA] });

      fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
    });

    it('should render projectable nodes if input provided', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.componentInstance.content = [
        fixture.componentInstance.vcRef.createEmbeddedView(
          fixture.componentInstance.tplRefs.first,
        ).rootNodes,
      ];
      fixture.detectChanges();

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(injectedElem.nativeElement.textContent).toBe('projected text1');
    });

    it('should change component if input updated', () => {
      fixture.componentInstance.component = InjectedComponent;
      fixture.componentInstance.content = [
        fixture.componentInstance.vcRef.createEmbeddedView(
          fixture.componentInstance.tplRefs.first,
        ).rootNodes,
      ];
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      const injectedElem = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(injectedElem.nativeElement.textContent).toBe('projected text1');

      fixture.componentInstance.content = [
        fixture.componentInstance.vcRef.createEmbeddedView(
          fixture.componentInstance.tplRefs.last,
        ).rootNodes,
      ];
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(2);

      const injectedElem2 = fixture.debugElement.query(
        By.directive(InjectedComponent),
      );

      expect(injectedElem2.nativeElement.textContent).toBe('projected text2');
      expect(injectedElem.componentInstance).not.toBe(
        injectedElem2.componentInstance,
      );
    });
  });
});

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'test',
  template: ``,
})
class TestComponent {
  component: Type<any>;
  injector: Injector;
  providers: StaticProvider[];
  content: any[][];

  comp: ComponentRef<any>;

  @ViewChildren(TemplateRef)
  tplRefs: QueryList<TemplateRef<any>>;

  constructor(public vcRef: ViewContainerRef) {}

  createdComponent(comp: ComponentRef<any>) {
    this.comp = comp;
  }
}
