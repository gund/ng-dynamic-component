/* eslint-disable @angular-eslint/component-selector */
import {
  Component,
  createNgModule,
  EnvironmentInjector,
  InjectionToken,
  Injector,
  NgModule,
  NgModuleRef,
  StaticProvider,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestFixture, TestSetup } from '../test';
import { DynamicComponent } from './dynamic.component';

describe('DynamicComponent', () => {
  @Component({ selector: 'injected', template: 'InjectedComponent' })
  class InjectedComponent {}

  @Component({
    selector: 'host',
    template: `<ndc-dynamic
      [ndcDynamicComponent]="component"
      [ndcDynamicInjector]="injector"
      [ndcDynamicProviders]="providers"
      [ndcDynamicContent]="content"
      [ndcDynamicNgModuleRef]="ngModuleRef"
      [ndcDynamicEnvironmentInjector]="environmentInjector"
      (ndcDynamicCreated)="createdComponent($event)"
    ></ndc-dynamic>`,
  })
  class HostComponent {
    component?: Type<any> | null;
    injector?: Injector;
    providers?: StaticProvider[];
    content?: Node[][];
    ngModuleRef?: NgModuleRef<unknown>;
    environmentInjector?: EnvironmentInjector | NgModuleRef<unknown>;
    createdComponent = jest.fn();
  }

  class InjectedTestFixture<THost> extends TestFixture<THost> {
    getInjectedComponent() {
      return this.getComponent(InjectedComponent)!;
    }
    getInjectedElem() {
      return this.getComponentElement(InjectedComponent)!;
    }
    getInjectedInjector() {
      return this.getInjectedElem()?.injector;
    }
    getInjectedText(): string | null {
      return this.getInjectedElem()?.nativeElement?.textContent;
    }
  }

  const testSetup = new TestSetup(HostComponent, {
    props: { component: InjectedComponent },
    ngModule: { declarations: [DynamicComponent, InjectedComponent] },
    fixtureCtor: InjectedTestFixture,
  });

  describe('@Input(ndcDynamicComponent)', () => {
    it('should do nothing when input is not provided', async () => {
      const fixture = await testSetup.redner({ props: { component: null } });

      // Only ndc-dynamic rendered
      expect(fixture.fixture.debugElement.children.length).toBe(1);
    });

    it('should render component from input', async () => {
      const fixture = await testSetup.redner();

      // ndc-dynamic + injected component rendered
      expect(fixture.fixture.debugElement.children.length).toBe(2);
      expect(fixture.getInjectedComponent()).toBeInstanceOf(InjectedComponent);
    });

    it('should emit event (ndcDynamicCreated) when `ComponentRef` created', async () => {
      const fixture = await testSetup.redner();

      expect(fixture.getHost().createdComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          componentType: InjectedComponent,
          instance: fixture.getInjectedComponent(),
        }),
      );
    });

    it('should clear view if input becomes null', async () => {
      const fixture = await testSetup.redner();

      // ndc-dynamic + injected component rendered
      expect(fixture.fixture.debugElement.children.length).toBe(2);

      fixture.setHostProps({ component: null });

      // Only ndc-dynamic rendered
      expect(fixture.fixture.debugElement.children.length).toBe(1);
    });

    it('should change component if input updated', async () => {
      @Component({ selector: 'injected2', template: 'Injected2Component' })
      class Injected2Component {}

      const fixture = await testSetup.redner();

      expect(fixture.getInjectedComponent()).toBeInstanceOf(InjectedComponent);
      expect(fixture.getComponent(Injected2Component)).toBeNull();

      fixture.setHostProps({ component: Injected2Component });

      expect(fixture.getInjectedComponent()).toBeNull();
      expect(fixture.getComponent(Injected2Component)).toBeInstanceOf(
        Injected2Component,
      );
    });

    it('should keep component if input not changed', async () => {
      const fixture = await testSetup.redner();

      const injectedComp = fixture.getInjectedComponent();

      expect(injectedComp).toBeInstanceOf(InjectedComponent);

      fixture.setHostProps({ component: InjectedComponent });

      expect(fixture.getInjectedComponent()).toBe(injectedComp);
    });
  });

  describe('@Input(ndcDynamicInjector)', () => {
    const testToken = new InjectionToken<any>('TEST_TOKEN');
    const testTokenValue = {};

    it('should use input if provided for injector', async () => {
      const injector = Injector.create({
        providers: [{ provide: testToken, useValue: testTokenValue }],
      });

      const fixture = await testSetup.redner({ props: { injector } });

      expect(fixture.getInjectedInjector().get(testToken)).toBe(testTokenValue);
    });

    it('should change component if input updated', async () => {
      const injector = Injector.create({
        providers: [{ provide: testToken, useValue: testTokenValue }],
      });

      const fixture = await testSetup.redner({ props: { injector } });

      const injectedComp = fixture.getInjectedComponent();

      expect(fixture.getInjectedInjector().get(testToken)).toBe(testTokenValue);

      const testTokenValue2 = {};
      const injector2 = Injector.create({
        providers: [{ provide: testToken, useValue: testTokenValue2 }],
      });

      fixture.setHostProps({ injector: injector2 });

      expect(fixture.getInjectedInjector().get(testToken)).toBe(
        testTokenValue2,
      );
      expect(fixture.getInjectedComponent()).not.toBe(injectedComp);
    });
  });

  describe('@Input(ndcDynamicProviders)', () => {
    const testToken = new InjectionToken<any>('TEST_TOKEN');
    const testTokenValue = {};

    it('should use input if provided for injector', async () => {
      const providers = [{ provide: testToken, useValue: testTokenValue }];

      const fixture = await testSetup.redner({ props: { providers } });

      expect(fixture.getInjectedInjector().get(testToken)).toBe(testTokenValue);
    });

    it('should change component if input updated', async () => {
      const providers = [{ provide: testToken, useValue: testTokenValue }];

      const fixture = await testSetup.redner({ props: { providers } });

      const injectedComp = fixture.getInjectedComponent();

      expect(fixture.getInjectedInjector().get(testToken)).toBe(testTokenValue);

      const testTokenValue2 = {};
      const providers2 = [{ provide: testToken, useValue: testTokenValue2 }];

      fixture.setHostProps({ providers: providers2 });

      expect(fixture.getInjectedInjector().get(testToken)).toBe(
        testTokenValue2,
      );
      expect(fixture.getInjectedComponent()).not.toBe(injectedComp);
    });
  });

  it('should use both [ndcDynamicInjector] and [ndcDynamicProviders] if provided', async () => {
    const testToken1 = new InjectionToken<any>('TEST_TOKEN_1');
    const testToken2 = new InjectionToken<any>('TEST_TOKEN_2');
    const testTokenValue1 = {};
    const testTokenValue2 = {};

    const providers = [{ provide: testToken1, useValue: testTokenValue1 }];
    const injector = Injector.create({
      providers: [{ provide: testToken2, useValue: testTokenValue2 }],
    });

    const fixture = await testSetup.redner({ props: { providers, injector } });

    expect(fixture.getInjectedInjector().get(testToken1)).toBe(testTokenValue1);
    expect(fixture.getInjectedInjector().get(testToken2)).toBe(testTokenValue2);
  });

  describe('@Input(ndcDynamicContent)', () => {
    beforeEach(() => {
      TestBed.overrideTemplate(
        InjectedComponent,
        'projected: <ng-content></ng-content>',
      );
    });

    it('should render projectable nodes if input provided', async () => {
      const content = [
        [
          document.createTextNode('Projected'),
          document.createTextNode(' content'),
        ],
      ];

      const fixture = await testSetup.redner({ props: { content } });

      expect(fixture.getInjectedText()).toMatch('projected: Projected content');
    });

    it('should change component if input updated', async () => {
      const content = [
        [
          document.createTextNode('Projected'),
          document.createTextNode(' content'),
        ],
      ];

      const fixture = await testSetup.redner({ props: { content } });

      expect(fixture.getInjectedText()).toMatch('projected: Projected content');

      fixture.setHostProps({
        content: [
          [
            document.createTextNode('Projected2'),
            document.createTextNode(' content2'),
          ],
        ],
      });

      expect(fixture.getInjectedText()).toMatch(
        'projected: Projected2 content2',
      );
    });
  });

  describe('@Input(ndcDynamicNgModuleRef)', () => {
    const testToken = new InjectionToken<any>('TEST_TOKEN');
    const testTokenValue = {};
    let ngModuleRef: NgModuleRef<any>;
    let parentInjector: Injector;

    @NgModule({
      providers: [{ provide: testToken, useValue: testTokenValue }],
    })
    class CustomNgModule {}

    it('should use input if provided for ngModuleRef', async () => {
      const fixture = await testSetup.redner();

      parentInjector = TestBed.inject(NgModuleRef).injector;
      ngModuleRef = createNgModule(CustomNgModule, parentInjector);
      fixture.setHostProps({ ngModuleRef });

      expect(fixture.getInjectedInjector().get(testToken)).toBe(testTokenValue);
    });

    it('should change component if input updated', async () => {
      const fixture = await testSetup.redner();

      parentInjector = TestBed.inject(NgModuleRef).injector;
      ngModuleRef = createNgModule(CustomNgModule, parentInjector);
      fixture.setHostProps({ ngModuleRef });

      const injectedComp = fixture.getInjectedComponent();

      expect(fixture.getInjectedInjector().get(testToken)).toBe(testTokenValue);

      const testTokenValue2 = {};
      @NgModule({
        providers: [{ provide: testToken, useValue: testTokenValue2 }],
      })
      class CustomNgModule2 {}
      ngModuleRef = createNgModule(CustomNgModule2, parentInjector);

      fixture.setHostProps({ ngModuleRef });

      expect(fixture.getInjectedInjector().get(testToken)).toBe(
        testTokenValue2,
      );
      expect(fixture.getInjectedComponent()).not.toBe(injectedComp);
    });
  });

  describe('@Input(ndcDynamicEnvironmentInjector)', () => {
    const testToken = new InjectionToken<any>('TEST_TOKEN');
    const testTokenValue = {};
    let ngModuleRef: NgModuleRef<any>;
    let environmentInjector: EnvironmentInjector;
    let parentInjector: Injector;

    @NgModule({
      providers: [{ provide: testToken, useValue: testTokenValue }],
    })
    class CustomNgModule {}

    it('should use input if provided for environmentInjector', async () => {
      const fixture = await testSetup.redner();

      parentInjector = TestBed.inject(NgModuleRef).injector;
      ngModuleRef = createNgModule(CustomNgModule, parentInjector);
      environmentInjector = ngModuleRef.injector;
      fixture.setHostProps({ environmentInjector });

      expect(fixture.getInjectedInjector().get(testToken)).toBe(testTokenValue);
    });

    it('should change component if input updated', async () => {
      const fixture = await testSetup.redner();

      parentInjector = TestBed.inject(NgModuleRef).injector;
      ngModuleRef = createNgModule(CustomNgModule, parentInjector);
      environmentInjector = ngModuleRef.injector;
      fixture.setHostProps({ environmentInjector });

      const injectedComp = fixture.getInjectedComponent();

      expect(fixture.getInjectedInjector().get(testToken)).toBe(testTokenValue);

      const testTokenValue2 = {};
      @NgModule({
        providers: [{ provide: testToken, useValue: testTokenValue2 }],
      })
      class CustomNgModule2 {}
      ngModuleRef = createNgModule(CustomNgModule2, parentInjector);
      environmentInjector = ngModuleRef.injector;

      fixture.setHostProps({ environmentInjector });

      expect(fixture.getInjectedInjector().get(testToken)).toBe(
        testTokenValue2,
      );
      expect(fixture.getInjectedComponent()).not.toBe(injectedComp);
    });
  });
});
