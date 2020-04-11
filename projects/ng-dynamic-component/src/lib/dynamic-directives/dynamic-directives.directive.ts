import {
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Inject,
  Injector,
  Input,
  IterableChanges,
  IterableDiffers,
  OnDestroy,
  Optional,
  Output,
  Type,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector/token';
import { IoFactoryService } from '../io/io-factory.service';
import { IoService } from '../io/io.service';
import { InputsType, OutputsType } from '../io/types';
import { extractNgParamTypes, getCtorParamTypes } from '../util';
import { WindowRefService } from '../window-ref/window-ref.service';

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
  // tslint:disable-next-line: ban-types
  onDestroy: (callback: Function) => void;
}

@Directive({
  selector: '[ndcDynamicDirectives],[ngComponentOutletNdcDynamicDirectives]',
})
export class DynamicDirectivesDirective implements OnDestroy, DoCheck {
  @Input()
  ndcDynamicDirectives: DynamicDirectiveDef<any>[];
  @Input()
  ngComponentOutletNdcDynamicDirectives: DynamicDirectiveDef<any>[];

  @Output()
  ndcDynamicDirectivesCreated = new EventEmitter<DirectiveRef<any>[]>();

  private lastCompInstance: any;

  private get directives() {
    return (
      this.ndcDynamicDirectives || this.ngComponentOutletNdcDynamicDirectives
    );
  }

  private get componentRef() {
    return this.componentInjector.componentRef;
  }

  private get compInstance() {
    return this.componentRef && this.componentRef.instance;
  }

  private get isCompChanged() {
    if (this.lastCompInstance !== this.compInstance) {
      this.lastCompInstance = this.compInstance;
      return true;
    }
    return false;
  }

  private get hostInjector() {
    return this.componentRef.injector;
  }

  private get hostVcr(): ViewContainerRef {
    // NOTE: Accessing private APIs of Angular
    // tslint:disable-next-line: no-string-literal
    return this.componentRef['_viewRef']['_viewContainerRef'];
  }

  private get reflect() {
    return (this.windowRef.nativeWindow as any).Reflect;
  }

  private dirRef = new Map<Type<any>, DirectiveRef<any>>();
  private dirIo = new Map<Type<any>, IoService>();
  private dirsDiffer = this.iterableDiffers
    .find([])
    .create<DynamicDirectiveDef<any>>((_, def) => def.type);

  constructor(
    private iterableDiffers: IterableDiffers,
    private ioFactoryService: IoFactoryService,
    private windowRef: WindowRefService,
    @Inject(DynamicComponentInjectorToken)
    @Optional()
    private componentInjector?: DynamicComponentInjector,
  ) {}

  ngDoCheck(): void {
    if (this.maybeDestroyDirectives()) {
      return;
    }

    const dirsChanges = this.dirsDiffer.diff(this.directives);

    if (!dirsChanges) {
      return this.updateDirectives();
    }

    this.processDirChanges(dirsChanges);
  }

  ngOnDestroy(): void {
    this.destroyAllDirectives();
  }

  private maybeDestroyDirectives() {
    if (this.isCompChanged || !this.componentRef) {
      this.dirsDiffer.diff([]);
      this.destroyAllDirectives();
    }

    return !this.componentRef;
  }

  private processDirChanges(
    changes: IterableChanges<DynamicDirectiveDef<any>>,
  ) {
    changes.forEachRemovedItem(({ item }) => this.destroyDirective(item));

    const createdDirs = [];
    changes.forEachAddedItem(({ item }) =>
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

    this.initDirIO(dir, dirDef.inputs, dirDef.outputs);
    this.callInitHooks(instance);

    this.dirRef.set(dir.type, dir);

    return dir;
  }

  private destroyAllDirectives() {
    this.dirRef.forEach(dir => this.destroyDirRef(dir));
    this.dirRef.clear();
    this.dirIo.clear();
  }

  private destroyDirective(dirDef: DynamicDirectiveDef<any>) {
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
      changeDetectorRef: this.componentRef.changeDetectorRef,
      hostView: this.componentRef.hostView,
      location: this.componentRef.location,
      destroy: this.componentRef.destroy,
      onDestroy: this.componentRef.onDestroy,
      injector: this.componentRef.injector,
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
    const directiveInjector = Injector.create({
      providers: [
        {
          provide: dirType,
          useClass: dirType,
          deps: this.resolveDirParamTypes(dirType),
        },
        { provide: ElementRef, useValue: this.componentRef.location },
      ],
      parent: this.hostInjector,
      name: `DynamicDirectiveInjector:${dirType.name}@${this.componentRef.componentType.name}`,
    });

    return directiveInjector.get(dirType);
  }

  private resolveDirParamTypes(dirType: Type<any>): any[] {
    return (
      // First try Angular Compiler's metadata
      extractNgParamTypes(dirType) ??
      // Then fallback to Typescript Reflect API
      getCtorParamTypes(dirType, this.reflect) ??
      // Bailout
      []
    );
  }

  private callInitHooks(obj: any) {
    this.callHook(obj, 'ngOnInit');
    this.callHook(obj, 'ngDoCheck');
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
