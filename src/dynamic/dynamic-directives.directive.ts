import {
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Host,
  Inject,
  Injector,
  Input,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  Type,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { IoFactoryService } from './io-factory.service';
import { InputsType, IoService, OutputsType } from './io.service';
import { getCtorType } from './util';

export interface DynamicDirectiveDef<T> {
  type: Type<T>;
  inputs?: InputsType;
  outputs?: OutputsType;
}

export function dynamicDirectiveDef<T>(
  type: Type<T>,
  inputs?: InputsType,
  outputs?: OutputsType,
): DynamicDirectiveDef<T> {
  return { type, inputs, outputs };
}

export interface DirectiveRef<T> {
  instance: T;
  type: Type<T>;
  injector: Injector;
  hostComponent: Type<any>;
  hostView: ViewRef;
  location: ElementRef;
  changeDetectorRef: ChangeDetectorRef;
  onDestroy: (callback: Function) => void;
}

@Directive({
  selector: '[ndcDynamicDirectives],[ngComponentOutletNdcDynamicDirectives]',
})
export class DynamicDirectivesDirective implements OnInit, OnDestroy, DoCheck {
  @Input()
  ndcDynamicDirectives: DynamicDirectiveDef<any>[];
  @Input()
  ngComponentOutletNdcDynamicDirectives: DynamicDirectiveDef<any>[];

  @Output()
  ndcDynamicDirectivesCreated = new EventEmitter<DirectiveRef<any>[]>();

  private componentInjector: ComponentInjector = this.injector.get(
    this.componentInjectorType,
    null,
  );

  private get directives() {
    return (
      this.ndcDynamicDirectives || this.ngComponentOutletNdcDynamicDirectives
    );
  }

  private get compInjector() {
    return this.componentOutletInjector || this.componentInjector;
  }

  private get componentRef() {
    return this.compInjector.componentRef;
  }

  private get hostInjector() {
    return this.componentRef.injector;
  }

  private get hostVcr(): ViewContainerRef {
    return this.componentRef['_viewRef']['_viewContainerRef'];
  }

  private dirRef = new Map<Type<any>, DirectiveRef<any>>();
  private dirIo = new Map<Type<any>, IoService>();
  private dirsDiffer = this.iterableDiffers
    .find([])
    .create<DynamicDirectiveDef<any>>((_, def) => def.type);

  constructor(
    private injector: Injector,
    private iterableDiffers: IterableDiffers,
    private ioFactoryService: IoFactoryService,
    @Inject(COMPONENT_INJECTOR)
    private componentInjectorType: ComponentInjector,
    @Host()
    @Optional()
    private componentOutletInjector: ComponentOutletInjectorDirective,
  ) {}

  ngOnInit(): void {
    if (!this.componentRef) {
      throw Error('DynamicDirectivesDirective: ComponentRef not available!');
    }
  }

  ngDoCheck(): void {
    this.checkDirectives();
  }

  ngOnDestroy(): void {
    this.dirRef.forEach(dir => this.destroyDirRef(dir));
    this.dirRef.clear();
    this.dirIo.clear();
  }

  private checkDirectives() {
    const dirsChanges = this.dirsDiffer.diff(this.directives);

    if (!dirsChanges) {
      return this.updateDirectives();
    }

    dirsChanges.forEachRemovedItem(({ item }) => this.destroyDirective(item));

    const createdDirs = [];

    dirsChanges.forEachAddedItem(({ item }) =>
      createdDirs.push(this.initDirective(item)),
    );

    if (createdDirs.length) {
      this.ndcDynamicDirectivesCreated.emit(createdDirs.filter(Boolean));
    }
  }

  private updateDirectives() {
    this.directives.forEach(dir => this.updateDirective(dir));
  }

  private updateDirective(dirDef: DynamicDirectiveDef<any>) {
    const io = this.dirIo.get(dirDef.type);
    io.update(dirDef.inputs, dirDef.outputs, false, false);
    io.maybeUpdate();
  }

  private initDirective(
    dirDef: DynamicDirectiveDef<any>,
  ): DirectiveRef<any> | undefined {
    if (this.dirRef.has(dirDef.type)) {
      return;
    }

    const instance = this.createDirective(dirDef.type);
    const dir = {
      instance,
      type: dirDef.type,
      injector: this.hostInjector,
      hostComponent: this.componentRef.instance,
      hostView: this.componentRef.hostView,
      location: this.componentRef.location,
      changeDetectorRef: this.componentRef.changeDetectorRef,
      onDestroy: this.componentRef.onDestroy,
    };

    this.callInitHooks(instance);
    this.initDirIO(dir, dirDef.inputs, dirDef.outputs);

    this.dirRef.set(dir.type, dir);

    return dir;
  }

  private destroyDirective(dirDef: DynamicDirectiveDef<any>) {
    if (!this.dirRef.has(dirDef.type)) {
      return;
    }

    this.destroyDirRef(this.dirRef.get(dirDef.type));
    this.dirRef.delete(dirDef.type);
    this.dirIo.delete(dirDef.type);
  }

  private initDirIO(dir: DirectiveRef<any>, inputs?: any, outputs?: any) {
    const io = this.ioFactoryService.create();
    io.init(
      { componentRef: this.dirToCompDef(dir) },
      { trackOutputChanges: true },
    );
    io.update(inputs, outputs, !!inputs, !!outputs);
    this.dirIo.set(dir.type, io);
  }

  private dirToCompDef(dir: DirectiveRef<any>): ComponentRef<any> {
    return {
      ...this.componentRef,
      destroy: this.componentRef.destroy,
      onDestroy: this.componentRef.onDestroy,
      instance: dir.instance,
      componentType: dir.type,
    };
  }

  private destroyDirRef(dir: DirectiveRef<any>) {
    const io = this.dirIo.get(dir.type);
    io.ngOnDestroy();

    if ('ngOnDestroy' in dir.instance) {
      dir.instance.ngOnDestroy();
    }
  }

  private createDirective<T>(dirType: Type<T>): T {
    const ctorParams: any[] = getCtorType(dirType);
    const resolvedParams = ctorParams.map(p => this.resolveDep(p));
    return new dirType(...resolvedParams);
  }

  private resolveDep(dep: any): any {
    return this.maybeResolveVCR(dep) || this.hostInjector.get(dep);
  }

  private maybeResolveVCR(dep: any): ViewContainerRef | undefined {
    if (dep === ViewContainerRef) {
      return this.hostVcr;
    }
  }

  private callInitHooks(obj: any) {
    this.callHook(obj, 'ngOnInit');
    this.callHook(obj, 'ngAfterContentInit');
    this.callHook(obj, 'ngAfterContentChecked');
    this.callHook(obj, 'ngAfterViewInit');
    this.callHook(obj, 'ngAfterViewChecked');
  }

  private callHook(obj: any, hook: string, args: any[] = []) {
    if (obj[hook]) {
      obj[hook](...args);
    }
  }
}
