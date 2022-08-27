import { Component, DebugElement, Type } from '@angular/core';
import {
  ComponentFixture,
  MetadataOverride,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export type PropsOf<T> = Partial<T>;

export interface TestSetupConfig<THost, TFixture extends TestFixture<THost>> {
  template?: string;
  props?: PropsOf<THost>;
  hostOverrides?: MetadataOverride<Component>;
  ngModule?: TestModuleMetadata;
  cleanNgModule?: boolean;
  skipDetect?: true;
  fixtureCtor?: TestFixtureCtor<THost, TFixture>;
}

export interface TestFixtureCtor<THost, TFixture extends TestFixture<THost>> {
  new (fixture: ComponentFixture<THost>): TFixture;
}

export class TestSetup<THost, TFixture extends TestFixture<THost>> {
  constructor(
    protected hostComponent: Type<THost>,
    protected config?: TestSetupConfig<THost, TFixture>,
  ) {}

  /**
   * Render host component with optional config
   */
  async redner<
    THostEx = {},
    TFixtureEx extends TestFixture<THost & THostEx> = TFixture &
      TestFixture<THost & THostEx>,
  >(config?: TestSetupConfig<THost, TFixture>): Promise<TFixtureEx> {
    this.configureModule(config);

    const options = this.mergeConfig(config);

    if (options.hostOverrides !== undefined) {
      TestBed.overrideComponent(this.hostComponent, options.hostOverrides);
    }

    if (options.template !== undefined) {
      TestBed.overrideTemplate(this.hostComponent, options.template);
    }

    await TestBed.compileComponents();

    const fixture = this.createFixture(options);

    if (options.props !== undefined) {
      fixture.setHostPropsNoDetect(options.props);
    }

    if (!options.skipDetect) {
      fixture.detectChanges();
    }

    return fixture as any;
  }

  protected configureModule(config?: TestSetupConfig<THost, TFixture>) {
    if (this.config?.ngModule && (!config || !config.cleanNgModule)) {
      TestBed.configureTestingModule(this.config?.ngModule);
    }
    if (config?.ngModule) {
      TestBed.configureTestingModule(config?.ngModule);
    }
    TestBed.configureTestingModule({ declarations: [this.hostComponent] });
  }

  protected mergeConfig(
    config?: TestSetupConfig<THost, TFixture>,
  ): TestSetupConfig<THost, TFixture> {
    return {
      ...this.config,
      ...config,
      props: Object.assign({}, this.config?.props, config?.props),
    };
  }

  protected createFixture(options: TestSetupConfig<THost, TFixture>): TFixture {
    const fixtureCtor =
      options.fixtureCtor ?? (TestFixture as TestFixtureCtor<THost, TFixture>);
    return new fixtureCtor(TestBed.createComponent(this.hostComponent));
  }
}

export class TestFixture<THost> {
  protected hostComponentType = this.fixture.componentRef.componentType;

  constructor(public fixture: ComponentFixture<THost>) {}

  detectChanges() {
    this.fixture.detectChanges();
    return this;
  }

  /**
   * Get host component instance
   */
  getHost() {
    return this.fixture.componentInstance;
  }

  /**
   * Get host DebugElement
   */
  getHostElement() {
    return this.fixture.debugElement;
  }

  /**
   * Get rendered component instance or `null` by it's type
   */
  getComponent<C>(component: Type<C>): C | null {
    return this.getComponentElement(component)?.componentInstance ?? null;
  }

  /**
   * Get rendered component DebugElement or `null` by it's type
   */
  getComponentElement<C>(component: Type<C>): DebugElement | null {
    return this.fixture.debugElement.query(By.directive(component));
  }

  /**
   * Set props on host comopnent and detect changes
   */
  setHostProps(props: PropsOf<THost>) {
    return this.setProps(props, this.hostComponentType);
  }

  /**
   * Set props on host comopnent without detecting changes
   */
  setHostPropsNoDetect(props: PropsOf<THost>) {
    return this.setPropsNoDetect(props, this.hostComponentType);
  }

  /**
   * Set props on rendered comopnent and detect changes
   */
  setProps<C>(props: PropsOf<C>, component: Type<C>) {
    this.setPropsNoDetect(props, component);
    this.detectChanges();
    return this;
  }

  /**
   * Set props on rendered comopnent without detecting changes
   */
  setPropsNoDetect<C>(props: PropsOf<C>, component: Type<C>) {
    const instance =
      component === this.hostComponentType
        ? this.getHost()
        : this.getComponent(component);
    Object.assign(instance, props);
    return this;
  }
}
