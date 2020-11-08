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
  ViewRef,
} from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';
import { InputsType, IoFactoryService, IoService, OutputsType } from '../io';
import { extractNgParamTypes, getCtorParamTypes, isOnDestroy } from '../util';
import { WindowRefService } from '../window-ref';

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
  hostComponent: unknown;
  hostView: ViewRef;
  location: ElementRef;
  changeDetectorRef: ChangeDetectorRef;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onDestroy: (callback: Function) => void;
}

/**
 * @experimental Dynamic directives is an experimental API that may not work as expected.
 *
 * NOTE: There is a known issue with OnChanges hook not beign triggered on dynamic directives
 * since this part of functionality has been removed from the core as Angular now
 * supports this out of the box for dynamic components.
 */
@Directive({
  selector: '[ndcDynamicDirectives],[ngComponentOutletNdcDynamicDirectives]',
  providers: [IoFactoryService],
})
export class DynamicDirectivesDirective implements OnDestroy, DoCheck {
  @Input()
  ndcDynamicDirectives?: DynamicDirectiveDef<unknown>[];
  @Input()
  ngComponentOutletNdcDynamicDirectives?: DynamicDirectiveDef<unknown>[];

  @Output()
  ndcDynamicDirectivesCreated = new EventEmitter<DirectiveRef<unknown>[]>();

  private lastCompInstance: unknown;

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

  private get reflect() {
    return (this.windowRef.nativeWindow as any).Reflect;
  }

  private dirRef = new Map<Type<unknown>, DirectiveRef<unknown>>();
  private dirIo = new Map<Type<unknown>, IoService>();
  private dirsDiffer = this.iterableDiffers
    .find([])
    .create<DynamicDirectiveDef<unknown>>((_, def) => def.type);

  constructor(
    private injector: Injector,
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
    changes: IterableChanges<DynamicDirectiveDef<unknown>>,
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
    this.directives?.forEach((dir) => this.updateDirective(dir));
  }

  private updateDirective(dirDef: DynamicDirectiveDef<unknown>) {
    const io = this.dirIo.get(dirDef.type);
    io.update(dirDef.inputs, dirDef.outputs);
    io.maybeUpdate();
  }

  private initDirective(
    dirDef: DynamicDirectiveDef<unknown>,
  ): DirectiveRef<unknown> | undefined {
    if (this.dirRef.has(dirDef.type)) {
      return;
    }

    const instance = this.createDirective(dirDef.type);
    const directiveRef: DirectiveRef<unknown> = {
      instance,
      type: dirDef.type,
      injector: this.hostInjector,
      hostComponent: this.componentRef.instance,
      hostView: this.componentRef.hostView,
      location: this.componentRef.location,
      changeDetectorRef: this.componentRef.changeDetectorRef,
      onDestroy: this.componentRef.onDestroy,
    };

    this.initDirIO(directiveRef, dirDef);
    this.callInitHooks(instance);

    this.dirRef.set(directiveRef.type, directiveRef);

    return directiveRef;
  }

  private destroyAllDirectives() {
    this.dirRef.forEach((dir) => this.destroyDirRef(dir));
    this.dirRef.clear();
    this.dirIo.clear();
  }

  private destroyDirective(dirDef: DynamicDirectiveDef<unknown>) {
    this.destroyDirRef(this.dirRef.get(dirDef.type));
    this.dirRef.delete(dirDef.type);
    this.dirIo.delete(dirDef.type);
  }

  private initDirIO(
    dirRef: DirectiveRef<any>,
    dirDef: DynamicDirectiveDef<any>,
  ) {
    const io = this.ioFactoryService.create();
    io.init(
      { componentRef: this.dirToCompDef(dirRef, dirDef) },
      { trackOutputChanges: true },
    );
    io.update(dirDef.inputs, dirDef.outputs);
    this.dirIo.set(dirRef.type, io);
  }

  private dirToCompDef(
    dirRef: DirectiveRef<unknown>,
    dirDef: DynamicDirectiveDef<unknown>,
  ): ComponentRef<unknown> {
    return {
      changeDetectorRef: this.componentRef.changeDetectorRef,
      hostView: this.componentRef.hostView,
      location: this.componentRef.location,
      destroy: this.componentRef.destroy,
      onDestroy: this.componentRef.onDestroy,
      injector: this.componentRef.injector,
      instance: dirRef.instance,
      componentType: dirRef.type,
      setInput: (name, value) => (dirRef.instance[name] = value),
    };
  }

  private destroyDirRef(dir: DirectiveRef<unknown>) {
    const io = this.dirIo.get(dir.type);
    io.ngOnDestroy();

    if (isOnDestroy(dir.instance)) {
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

  private resolveDirParamTypes(dirType: Type<unknown>): unknown[] {
    return (
      // First try Angular Compiler's metadata
      extractNgParamTypes(dirType) ??
      // Then fallback to Typescript Reflect API
      getCtorParamTypes(dirType, this.reflect) ??
      // Bailout
      []
    );
  }

  private callInitHooks(obj: unknown) {
    this.callHook(obj, 'ngOnInit');
    this.callHook(obj, 'ngDoCheck');
    this.callHook(obj, 'ngAfterContentInit');
    this.callHook(obj, 'ngAfterContentChecked');
    this.callHook(obj, 'ngAfterViewInit');
    this.callHook(obj, 'ngAfterViewChecked');
  }

  private callHook(obj: unknown, hook: string, args: unknown[] = []) {
    if (obj[hook]) {
      obj[hook](...args);
    }
  }
}
