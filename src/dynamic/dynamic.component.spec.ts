import {
  Component,
  ComponentRef,
  InjectionToken,
  Injector,
  NO_ERRORS_SCHEMA,
  QueryList,
  TemplateRef,
  Type,
  ViewChildren,
  ViewContainerRef,
  StaticProvider,
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AnotherInjectedComponent, InjectedComponent, TestModule } from '../test/index';
import { DynamicComponent } from './dynamic.component';

/* tslint:disable:no-unused-variable */

const token = new InjectionToken<any>('TOKEN');
const tokenValue = {};

describe('DynamicComponent', () => {
    let testTemplate = `<ndc-dynamic [ndcDynamicComponent]="component"
                                   [ndcDynamicInjector]="injector"
                                   [ndcDynamicProviders]="providers"
                                   (ndcDynamicCreated)="createdComponent($event)"
                                   [ndcDynamicContent]="content"></ndc-dynamic>`;
    let fixture: ComponentFixture<TestComponent>, createComp = true;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TestModule],
            declarations: [TestComponent, DynamicComponent]
        })
            .overrideComponent(TestComponent, { set: { template: testTemplate } });

        if (createComp) {
            fixture = TestBed.createComponent(TestComponent) as any;
        }
    }));

    it('should do nothing when [ndcDynamicComponent] not provided', () => {
        fixture.componentInstance.component = null;
        fixture.detectChanges();

        // Only ndc-dynamic rendered
        expect(fixture.debugElement.children.length).toBe(1);
    });

    it('should render component from [ndcDynamicComponent]', () => {
        fixture.componentInstance.component = InjectedComponent;
        fixture.detectChanges();

        const injectedElem = fixture.debugElement.query(By.directive(InjectedComponent));

        expect(fixture.debugElement.children.length).toBe(2);
        expect(injectedElem).not.toBeNull();
        expect(injectedElem.componentInstance).toEqual(jasmine.any(InjectedComponent));
    });

    it('should emit event when component created', () => {
        fixture.componentInstance.component = InjectedComponent;
        fixture.detectChanges();

        expect(fixture.componentInstance.comp.instance).toBeInstanceOf(InjectedComponent);
    });

    it('should clear view if [ndcDynamicComponent] becomes null', () => {
        fixture.componentInstance.component = InjectedComponent;
        fixture.detectChanges();

        expect(fixture.debugElement.children.length).toBe(2);

        fixture.componentInstance.component = null;
        fixture.detectChanges();

        expect(fixture.debugElement.children.length).toBe(1);
    });

    it('should chnage component if [ndcDynamicComponent] updates', () => {
        fixture.componentInstance.component = InjectedComponent;
        fixture.detectChanges();

        const injectedElem = fixture.debugElement.query(By.directive(InjectedComponent));

        expect(fixture.debugElement.children.length).toBe(2);
        expect(injectedElem).not.toBeNull();
        expect(injectedElem.componentInstance).toEqual(jasmine.any(InjectedComponent));

        fixture.componentInstance.component = AnotherInjectedComponent;
        fixture.detectChanges();

        const anotherInjectedElem = fixture.debugElement.query(By.directive(AnotherInjectedComponent));

        expect(fixture.debugElement.children.length).toBe(2);
        expect(anotherInjectedElem).not.toBeNull();
        expect(anotherInjectedElem.componentInstance).toEqual(jasmine.any(AnotherInjectedComponent));
    });

    it('should keep component if [ndcDynamicComponent] not changed', () => {
        fixture.componentInstance.component = InjectedComponent;
        fixture.detectChanges();

        expect(fixture.debugElement.children.length).toBe(2);

        fixture.componentInstance.providers = [];
        fixture.detectChanges();

        expect(fixture.debugElement.children.length).toBe(2);
    });

    it('should use [ndcDynamicInjector] if provided', () => {
        fixture.componentInstance.component = InjectedComponent;
        fixture.componentInstance.injector = Injector.create([
            { provide: token, useValue: tokenValue }
        ], fixture.componentRef.injector);
        fixture.detectChanges();

        const injectedElem = fixture.debugElement.query(By.directive(InjectedComponent));

        expect(injectedElem.injector.get(token)).toBe(tokenValue);
    });

    it('should use [ndcDynamicProviders] if provided', () => {
        fixture.componentInstance.component = InjectedComponent;
        fixture.componentInstance.providers = [{ provide: token, useValue: tokenValue }];
        fixture.detectChanges();

        const injectedElem = fixture.debugElement.query(By.directive(InjectedComponent));

        expect(injectedElem.injector.get(token)).toBe(tokenValue);
    });

    it('should use both [ndcDynamicInjector] and [ndcDynamicProviders] if provided', () => {
        const anotherToken = new InjectionToken<any>('AnotherToken');
        const anotherTokenValue = {};

        fixture.componentInstance.component = InjectedComponent;
        fixture.componentInstance.injector = Injector.create([
            { provide: token, useValue: tokenValue }
        ], fixture.componentRef.injector);
        fixture.componentInstance.providers = [{ provide: anotherToken, useValue: anotherTokenValue }];
        fixture.detectChanges();

        const injectedElem = fixture.debugElement.query(By.directive(InjectedComponent));

        expect(injectedElem.injector.get(token)).toEqual(tokenValue);
        expect(injectedElem.injector.get(anotherToken)).toEqual(anotherTokenValue);
    });

    describe('projectable nodes', () => {
        beforeAll(() => createComp = false);
        afterAll(() => createComp = true);

        it('should be rendered if [ndcDynamicContent] provided', () => {
            TestBed
                .overrideComponent(TestComponent, { set: { template: `<ng-template>projected text</ng-template>${testTemplate}` } })
                .overrideComponent(InjectedComponent, { set: { template: `<ng-content></ng-content>` } })
                .configureTestingModule({ schemas: [NO_ERRORS_SCHEMA] });

            fixture = TestBed.createComponent(TestComponent) as any;
            fixture.detectChanges();

            fixture.componentInstance.component = InjectedComponent;
            fixture.componentInstance.content = [
                fixture.componentInstance.vcRef
                    .createEmbeddedView(fixture.componentInstance.tplRefs.first)
                    .rootNodes
            ];
            fixture.detectChanges();

            const injectedElem = fixture.debugElement.query(By.directive(InjectedComponent));

            expect(injectedElem.nativeElement.textContent).toBe('projected text');
        });
    });
});

@Component({
    selector: 'test',
    template: ``
})
class TestComponent {
    component: Type<any>;
    injector: Injector;
    providers: StaticProvider[];
    content: any[][];

    comp: ComponentRef<any>;

    @ViewChildren(TemplateRef) tplRefs: QueryList<TemplateRef<any>>;

    constructor(public vcRef: ViewContainerRef) { }

    createdComponent(comp: ComponentRef<any>) {
        this.comp = comp;
    }
}
