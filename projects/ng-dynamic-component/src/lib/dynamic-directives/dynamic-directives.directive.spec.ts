/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/directive-selector */
import { CommonModule, NgClass } from '@angular/common';
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  Type,
  ViewContainerRef,
} from '@angular/core';

import { TestFixture, TestSetup } from '../../test';
import { ComponentOutletInjectorDirective } from '../component-injector';
import { DynamicComponent as NdcDynamicComponent } from '../dynamic.component';
import { IoFactoryService } from '../io';
import {
  DirectiveRef,
  DynamicDirectiveDef,
  dynamicDirectiveDef,
  DynamicDirectivesDirective,
} from './dynamic-directives.directive';

describe('Directive: DynamicDirectives', () => {
  @Component({ selector: 'dynamic', template: `` })
  class DynamicComponent {}

  @Component({
    selector: 'host',
    template: `<ng-container
      [ngComponentOutlet]="component"
      [ndcDynamicDirectives]="directives"
      (ndcDynamicDirectivesCreated)="onCreated($event)"
    ></ng-container>`,
  })
  class HostComponent {
    component?: Type<any> | null;
    directives?: DynamicDirectiveDef<any>[] | null;
    onCreated = jest.fn();
  }

  @Directive({ selector: '[mock]' })
  class MockDirective
    implements
      OnInit,
      OnDestroy,
      OnChanges,
      AfterViewInit,
      AfterViewChecked,
      AfterContentInit,
      AfterContentChecked
  {
    static INSTANCES = new Set<MockDirective>();
    @Input()
    set in(val: any) {
      this.logHook('inputSet:' + val)();
      this._in = val;
    }
    get in(): any {
      return this._in;
    }
    private _in: any;
    @Input()
    in2: any;
    @Output()
    out = new EventEmitter<any>();
    @Output()
    out2 = new EventEmitter<any>();
    hooksOrder: string[] = [];
    ngAfterContentChecked = jest
      .fn()
      .mockImplementation(this.logHook('ngAfterContentChecked'));
    ngAfterContentInit = jest
      .fn()
      .mockImplementation(this.logHook('ngAfterContentInit'));
    ngAfterViewChecked = jest
      .fn()
      .mockImplementation(this.logHook('ngAfterViewChecked'));
    ngAfterViewInit = jest
      .fn()
      .mockImplementation(this.logHook('ngAfterViewInit'));
    ngOnChanges = jest.fn().mockImplementation(this.logHook('ngOnChanges'));
    ngOnInit = jest.fn().mockImplementation(this.logHook('ngOnInit'));
    ngDoCheck = jest.fn().mockImplementation(this.logHook('ngDoCheck'));
    ngOnDestroy = jest.fn().mockImplementation(() => {
      this.logHook('ngOnDestroy')();
      MockDirective.INSTANCES.delete(this);
    });
    constructor() {
      MockDirective.INSTANCES.add(this);
    }
    private logHook(name: string) {
      return () => this.hooksOrder.push(name);
    }
  }

  @Directive({ selector: '[mock2]' })
  class Mock2Directive extends MockDirective {}

  class DirectivesTestFixture<THost> extends TestFixture<THost> {
    getDirectives() {
      return Array.from(MockDirective.INSTANCES);
    }
    getFirstDirective() {
      return this.getDirectives().shift();
    }
    getLastDirective() {
      return this.getDirectives().pop();
    }
  }

  const testSetup = new TestSetup(HostComponent, {
    props: { component: DynamicComponent },
    ngModule: {
      declarations: [
        DynamicDirectivesDirective,
        ComponentOutletInjectorDirective,
        HostComponent,
        DynamicComponent,
      ],
      providers: [IoFactoryService],
    },
    fixtureCtor: DirectivesTestFixture,
  });

  beforeEach(() => {
    MockDirective.INSTANCES.clear();
  });

  describe('directives', () => {
    it('should init directives', async () => {
      const directives = [
        dynamicDirectiveDef(MockDirective),
        dynamicDirectiveDef(Mock2Directive),
      ];

      const fixture = await testSetup.redner();

      expect(MockDirective.INSTANCES.size).toBe(0);

      fixture.setHostProps({ directives });

      expect(MockDirective.INSTANCES.size).toBe(2);
    });

    it('should destroy all directives', async () => {
      const directives = [
        dynamicDirectiveDef(MockDirective),
        dynamicDirectiveDef(Mock2Directive),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(2);

      fixture.setHostProps({ directives: null });

      expect(MockDirective.INSTANCES.size).toBe(0);
    });

    it('should call static life-cycle hooks in order', async () => {
      const directives = [dynamicDirectiveDef(MockDirective)];

      const fixture = await testSetup.redner({ props: { directives } });

      const dir = fixture.getFirstDirective()!;

      expect(dir).toBeDefined();
      expect(dir.ngOnInit).toHaveBeenCalledTimes(1);
      expect(dir.ngAfterContentInit).toHaveBeenCalledTimes(1);
      expect(dir.ngAfterContentChecked).toHaveBeenCalledTimes(1);
      expect(dir.ngAfterViewInit).toHaveBeenCalledTimes(1);
      expect(dir.ngAfterViewChecked).toHaveBeenCalledTimes(1);

      // Verify order
      expect(dir.hooksOrder).toEqual([
        'ngOnInit',
        'ngDoCheck',
        'ngAfterContentInit',
        'ngAfterContentChecked',
        'ngAfterViewInit',
        'ngAfterViewChecked',
      ]);
    });

    // Due to removed OnChanges notification functionality for components
    // Directives now do not have a way to get OnChanges notifications
    xit('should set inputs before ngOnInit hook called', async () => {
      const directives = [dynamicDirectiveDef(MockDirective, { in: true })];

      const fixture = await testSetup.redner({ props: { directives } });

      const dir = fixture.getFirstDirective()!;

      expect(dir).toBeDefined();
      expect(dir.hooksOrder).toEqual([
        'inputSet:true',
        'ngOnChanges',
        'ngOnInit',
        'ngDoCheck',
        'ngAfterContentInit',
        'ngAfterContentChecked',
        'ngAfterViewInit',
        'ngAfterViewChecked',
      ]);
    });

    it('should not init directives of same type', async () => {
      const directives = [
        dynamicDirectiveDef(MockDirective),
        dynamicDirectiveDef(MockDirective),
        dynamicDirectiveDef(MockDirective),
      ];

      await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(1);
    });

    it('should init added directive', async () => {
      const directives = [dynamicDirectiveDef(MockDirective)];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(1);

      fixture.setHostProps({
        directives: [
          dynamicDirectiveDef(MockDirective),
          dynamicDirectiveDef(Mock2Directive),
        ],
      });

      expect(MockDirective.INSTANCES.size).toBe(2);
    });

    it('should init pushed directive', async () => {
      const directives = [dynamicDirectiveDef(MockDirective)];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(1);

      directives.push(dynamicDirectiveDef(Mock2Directive));

      fixture.detectChanges();

      expect(MockDirective.INSTANCES.size).toBe(2);
    });

    it('should destroy removed directive', async () => {
      const directives = [
        dynamicDirectiveDef(MockDirective),
        dynamicDirectiveDef(Mock2Directive),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(2);

      fixture.setHostProps({
        directives: [dynamicDirectiveDef(MockDirective)],
      });

      expect(MockDirective.INSTANCES.size).toBe(1);
    });

    it('should not do anything when no component', async () => {
      const directives = [dynamicDirectiveDef(MockDirective)];

      await testSetup.redner({
        props: { directives, component: null },
      });

      expect(MockDirective.INSTANCES.size).toBe(0);
    });

    it('should destroy directives when component unset', async () => {
      const directives = [dynamicDirectiveDef(MockDirective)];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(1);

      const dir = fixture.getFirstDirective()!;

      fixture.setHostProps({ component: null });

      expect(MockDirective.INSTANCES.size).toBe(0);
      expect(dir).toBeDefined();
      expect(dir.ngOnDestroy).toHaveBeenCalledTimes(1);
    });

    it('should re-create directives when component changed', async () => {
      @Component({ selector: 'dynamic2', template: '' })
      class Dynamic2Component {}

      const directives = [dynamicDirectiveDef(MockDirective)];

      const fixture = await testSetup.redner({
        props: { directives },
        ngModule: { declarations: [Dynamic2Component] },
      });

      expect(MockDirective.INSTANCES.size).toBe(1);

      const dir1 = fixture.getFirstDirective();

      fixture.setHostProps({ component: Dynamic2Component });

      expect(MockDirective.INSTANCES.size).toBe(1);

      const dir2 = fixture.getFirstDirective();

      expect(dir1).not.toBe(dir2);
    });
  });

  describe('@Output(ndcDynamicDirectivesCreated)', () => {
    it('should emit with dynamic directive refs', async () => {
      const directives = [dynamicDirectiveDef(MockDirective)];

      const fixture = await testSetup.redner({ props: { directives } });

      const dir = fixture.getFirstDirective();

      expect(fixture.getHost().onCreated).toHaveBeenCalledWith([
        expect.objectContaining({
          type: MockDirective,
          instance: dir,
        }),
      ]);
    });

    it('should emit with only added directive refs', async () => {
      const directives = [dynamicDirectiveDef(MockDirective)];

      const fixture = await testSetup.redner({ props: { directives } });

      fixture.getHost().onCreated.mockClear();

      fixture.setHostProps({
        directives: [
          dynamicDirectiveDef(MockDirective),
          dynamicDirectiveDef(Mock2Directive),
        ],
      });

      const lastDir = fixture.getLastDirective();

      expect(fixture.getHost().onCreated).toHaveBeenCalledTimes(1);
      expect(fixture.getHost().onCreated).toHaveBeenCalledWith([
        expect.objectContaining({
          type: Mock2Directive,
          instance: lastDir,
        }),
      ]);
    });
  });

  describe('injector', () => {
    it('should be able to inject `ElementRef`', async () => {
      @Directive({ selector: '[test]' })
      class TestDirective {
        constructor(public elem: ElementRef) {}
      }
      const directives = [dynamicDirectiveDef(TestDirective)];

      const fixture = await testSetup.redner({
        props: { directives },
        ngModule: { declarations: [TestDirective] },
      });

      const dir = fixture.getHost().onCreated.mock
        .lastCall[0][0] as DirectiveRef<TestDirective>;

      expect(dir.instance.elem).toBeInstanceOf(ElementRef);
    });

    it('should be able to inject `ChangeDetectorRef`', async () => {
      @Directive({ selector: '[test]' })
      class TestDirective {
        constructor(public cdr: ChangeDetectorRef) {}
      }
      const directives = [dynamicDirectiveDef(TestDirective)];

      const fixture = await testSetup.redner({
        props: { directives },
        ngModule: { declarations: [TestDirective] },
      });

      const dir = fixture.getHost().onCreated.mock
        .lastCall[0][0] as DirectiveRef<TestDirective>;

      expect(dir.instance.cdr).toEqual(
        expect.objectContaining(ChangeDetectorRef.prototype),
      );
    });

    it('should be able to inject `ViewContainerRef`', async () => {
      @Directive({ selector: '[test]' })
      class TestDirective {
        constructor(public vcr: ViewContainerRef) {}
      }
      const directives = [dynamicDirectiveDef(TestDirective)];

      const fixture = await testSetup.redner({
        props: { directives },
        ngModule: { declarations: [TestDirective] },
      });

      const dir = fixture.getHost().onCreated.mock
        .lastCall[0][0] as DirectiveRef<TestDirective>;

      expect(dir.instance.vcr).toEqual(
        expect.objectContaining(ViewContainerRef.prototype),
      );
    });
  });

  describe('directive inputs', () => {
    it('should set inputs on directive instance', async () => {
      const directives = [
        dynamicDirectiveDef(MockDirective, { in: 'in' }),
        dynamicDirectiveDef(Mock2Directive, { in2: 'in2' }),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(2);

      const [dir1, dir2] = fixture.getDirectives();

      expect(dir1.in).toBe('in');
      expect(dir2.in2).toBe('in2');
    });

    // BUG: OnCHanges are not called on dynamic directives currently
    xit('should call `OnChanges` hook with initial changes', async () => {
      const directives = [
        dynamicDirectiveDef(MockDirective, { in: 'val1' }),
        dynamicDirectiveDef(Mock2Directive, { in2: 'val2' }),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(2);

      const [dir1, dir2] = fixture.getDirectives();

      expect(dir1.ngOnChanges).toHaveBeenCalledWith({
        in: new SimpleChange(undefined, 'val1', true),
      });
      expect(dir2.ngOnChanges).toHaveBeenCalledWith({
        in2: new SimpleChange(undefined, 'val2', true),
      });
    });

    // BUG: OnCHanges are not called on dynamic directives currently
    xit('should call `OnChanges` when inputs change', async () => {
      const inputs1 = { in: 'val1' };
      const inputs2 = { in2: 'val2' };
      const directives = [
        dynamicDirectiveDef(MockDirective, inputs1),
        dynamicDirectiveDef(Mock2Directive, inputs2),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(2);

      const [dir1, dir2] = fixture.getDirectives();

      dir1.ngOnChanges.mockReset();
      dir2.ngOnChanges.mockReset();

      inputs1.in = 'new-val1';
      inputs2.in2 = 'new-val2';
      fixture.detectChanges();

      expect(dir1.ngOnChanges).toHaveBeenCalledWith({
        in: new SimpleChange('val1', 'new-val1', false),
      });
      expect(dir2.ngOnChanges).toHaveBeenCalledWith({
        in2: new SimpleChange('val2', 'new-val2', false),
      });

      dir1.ngOnChanges.mockReset();
      dir2.ngOnChanges.mockReset();

      inputs2.in2 = 'another-val2';
      fixture.detectChanges();

      expect(dir1.ngOnChanges).not.toHaveBeenCalled();
      expect(dir2.ngOnChanges).toHaveBeenCalledWith({
        in2: new SimpleChange('new-val2', 'another-val2', false),
      });
    });

    // BUG: OnCHanges are not called on dynamic directives currently
    xit('should call `OnChanges` when inputs replaced', async () => {
      const dirDef1 = dynamicDirectiveDef(MockDirective, { in: 'val1' });
      const dirDef2 = dynamicDirectiveDef(Mock2Directive, { in2: 'val2' });
      const directives = [dirDef1, dirDef2];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(2);

      const [dir1, dir2] = fixture.getDirectives();

      dir1.ngOnChanges.mockReset();
      dir2.ngOnChanges.mockReset();

      dirDef1.inputs = { in: 'new-val1' };
      fixture.detectChanges();

      expect(dir1.ngOnChanges).toHaveBeenCalledWith({
        in: new SimpleChange('val1', 'new-val1', false),
      });
      expect(dir2.ngOnChanges).not.toHaveBeenCalled();

      dir1.ngOnChanges.mockReset();
      dir2.ngOnChanges.mockReset();

      dirDef2.inputs = { in2: 'new-val2' };
      fixture.detectChanges();

      expect(dir1.ngOnChanges).not.toHaveBeenCalled();
      expect(dir2.ngOnChanges).toHaveBeenCalledWith({
        in2: new SimpleChange('val2', 'new-val2', false),
      });
    });
  });

  describe('directive outputs', () => {
    it('should be connected', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const directives = [
        dynamicDirectiveDef(MockDirective, undefined, { out: callback1 }),
        dynamicDirectiveDef(Mock2Directive, undefined, { out: callback2 }),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(2);

      const [dir1, dir2] = fixture.getDirectives();

      dir1.out.emit('data1');
      dir2.out.emit('data2');

      expect(callback1).toHaveBeenCalledWith('data1');
      expect(callback2).toHaveBeenCalledWith('data2');
    });

    it('should be connected when changed and disconnected from old', async () => {
      const callback = jest.fn();
      const outputs = { out: callback };
      const directives = [
        dynamicDirectiveDef(MockDirective, undefined, outputs),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(1);

      const dir = fixture.getFirstDirective()!;

      const callback2 = jest.fn();
      outputs.out = callback2;

      fixture.detectChanges();

      dir.out.emit('data');

      expect(callback2).toHaveBeenCalledWith('data');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should disconnect when removed', async () => {
      const callback = jest.fn();
      const outputs = { out: callback };
      const directives = [
        dynamicDirectiveDef(MockDirective, undefined, outputs),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(1);

      const dir = fixture.getFirstDirective()!;

      outputs.out = null!;

      fixture.detectChanges();

      dir.out.emit('data');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should disconnect when host component destroyed', async () => {
      const callback = jest.fn();
      const directives = [
        dynamicDirectiveDef(MockDirective, undefined, { out: callback }),
      ];

      const fixture = await testSetup.redner({ props: { directives } });

      expect(MockDirective.INSTANCES.size).toBe(1);

      const dir = fixture.getFirstDirective()!;

      fixture.setHostProps({ component: null });

      dir.out.emit('data');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should apply NgClass', async () => {
      const directives = [
        dynamicDirectiveDef(NgClass, { ngClass: 'cls1 cls2' }),
      ];

      const fixture = await testSetup.redner({
        props: { directives },
        ngModule: { imports: [CommonModule] },
      });

      const dynamicElem = fixture.getComponentElement(DynamicComponent)!;

      expect(dynamicElem).toBeTruthy();
      expect(dynamicElem.classes).toEqual({ cls1: true, cls2: true });
    });

    it('should work with `ngComponentOutlet` * syntax', async () => {
      const directives = [
        dynamicDirectiveDef(NgClass, { ngClass: 'cls1 cls2' }),
      ];

      const fixture = await testSetup.redner({
        props: { directives },
        template: `
          <ng-container
            *ngComponentOutlet="component; ndcDynamicDirectives: directives"
          ></ng-container>
        `,
        ngModule: { imports: [CommonModule] },
      });

      const dynamicElem = fixture.getComponentElement(DynamicComponent)!;

      expect(dynamicElem).toBeTruthy();
      expect(dynamicElem.classes).toEqual({ cls1: true, cls2: true });
    });

    it('should work with `ndc-dynamic`', async () => {
      const directives = [
        dynamicDirectiveDef(NgClass, { ngClass: 'cls1 cls2' }),
      ];

      const fixture = await testSetup.redner({
        props: { directives },
        template: `
          <ndc-dynamic
            [ndcDynamicComponent]="component"
            [ndcDynamicDirectives]="directives"
          ></ndc-dynamic>
        `,
        ngModule: {
          imports: [CommonModule],
          declarations: [NdcDynamicComponent],
        },
      });

      const dynamicElem = fixture.getComponentElement(DynamicComponent)!;

      expect(dynamicElem).toBeTruthy();
      expect(dynamicElem.classes).toEqual({ cls1: true, cls2: true });
    });
  });
});
