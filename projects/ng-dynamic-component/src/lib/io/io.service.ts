import {
  ChangeDetectorRef,
  ComponentFactory,
  ComponentFactoryResolver,
  forwardRef,
  Inject,
  Injectable,
  Injector,
  KeyValueChangeRecord,
  KeyValueChanges,
  KeyValueDiffers,
  OnDestroy,
  Optional,
  StaticProvider,
  Type,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';
import { IoEventArgumentToken } from './event-argument';
import {
  IoEventContextProviderToken,
  IoEventContextToken,
} from './event-context';
import {
  AnyFunction,
  EventHandler,
  InputsType,
  OutputsType,
  OutputWithArgs,
} from './types';

interface IOMapInfo {
  propName: string;
  templateName: string;
}

type IOMappingList = IOMapInfo[];

type KeyValueChangesAny = KeyValueChanges<string, unknown>;

interface OutputsTypeProcessed extends OutputsType {
  [k: string]: EventHandler;
}

@Injectable({ providedIn: 'root' })
export class IoServiceOptions {
  trackOutputChanges = false;
}

/**
 * A provider for the {@link IoService}
 * Use it instead of manually providing a service directly
 */
export const IoServiceProvider: StaticProvider = {
  provide: forwardRef(() => IoService),
  useClass: forwardRef(() => IoService),
  deps: [
    Injector,
    KeyValueDiffers,
    ComponentFactoryResolver,
    IoServiceOptions,
    DynamicComponentInjectorToken,
    IoEventArgumentToken,
    ChangeDetectorRef,
    [new Optional(), IoEventContextProviderToken],
  ],
};

@Injectable()
export class IoService implements OnDestroy {
  private lastComponentInst: unknown = null;
  private lastChangedInputs = new Set<string>();
  private inputsDiffer = this.differs.find({}).create();
  // TODO: Replace ComponentFactory once new API is created
  // @see https://github.com/angular/angular/issues/44926
  // eslint-disable-next-line deprecation/deprecation
  private compFactory: ComponentFactory<unknown> | null = null;
  private outputsShouldDisconnect$ = new Subject<void>();
  private outputsEventContext: unknown;

  private inputs: InputsType;
  private outputs: OutputsType;
  private outputsChanged: (outputs: OutputsType) => boolean = () => false;

  private get compRef() {
    return this.compInjector.componentRef;
  }

  private get componentInst() {
    return this.compRef ? this.compRef.instance : null;
  }

  private get componentInstChanged(): boolean {
    if (this.lastComponentInst !== this.componentInst) {
      this.lastComponentInst = this.componentInst;
      return true;
    } else {
      return false;
    }
  }

  constructor(
    private injector: Injector,
    private differs: KeyValueDiffers,
    // TODO: Replace ComponentFactoryResolver once new API is created
    // @see https://github.com/angular/angular/issues/44926
    // eslint-disable-next-line deprecation/deprecation
    private cfr: ComponentFactoryResolver,
    private options: IoServiceOptions,
    @Inject(DynamicComponentInjectorToken)
    private compInjector: DynamicComponentInjector,
    @Inject(IoEventArgumentToken)
    private eventArgument: string,
    private cdr: ChangeDetectorRef,
    @Inject(IoEventContextProviderToken)
    @Optional()
    private eventContextProvider: StaticProvider,
  ) {
    if (this.options.trackOutputChanges) {
      const outputsDiffer = this.differs.find({}).create();
      this.outputsChanged = (outputs) => !!outputsDiffer.diff(outputs);
    }
  }

  ngOnDestroy(): void {
    this._disconnectOutputs();
  }

  /**
   * Call when you know that inputs/outputs were changed
   * or when setting them for the first time
   */
  update(inputs: InputsType, outputs: OutputsType) {
    const changes = this.updateIO(inputs, outputs);

    const compChanged = this.componentInstChanged;

    if (compChanged || changes.inputsChanged) {
      const inputsChanges = this._getInputsChanges();
      if (inputsChanges) {
        this._updateChangedInputs(inputsChanges);
      }
      this.updateInputs(compChanged || !this.lastChangedInputs.size);
    }

    if (compChanged || changes.outputsChanged) {
      this.bindOutputs();
    }
  }

  /**
   * Call when you do not know if inputs/outputs changed
   *
   * Usually must be called from the `DoCheck` lifecycle hook
   */
  maybeUpdate() {
    if (this.componentInstChanged) {
      this.updateInputs(true);
      this.bindOutputs();
      return;
    }

    if (this.outputsChanged(this.outputs)) {
      this.bindOutputs();
    }

    if (!this.inputs) {
      return;
    }

    const inputsChanges = this._getInputsChanges();

    if (inputsChanges) {
      const isNotFirstChange = !!this.lastChangedInputs.size;
      this._updateChangedInputs(inputsChanges);

      if (isNotFirstChange) {
        this.updateInputs();
      }
    }
  }

  private updateIO(inputs: InputsType, outputs: OutputsType) {
    const inputsChanged = this.inputs !== inputs;
    const outputsChanged = this.outputs !== outputs;

    this.inputs = inputs;
    this.outputs = outputs;

    return { inputsChanged, outputsChanged };
  }

  private updateInputs(isFirstChange = false) {
    if (isFirstChange) {
      this._updateCompFactory();
    }

    const compRef = this.compRef;
    const inputs = this.inputs;

    if (!inputs || !compRef) {
      return;
    }

    const ifInputChanged = this.lastChangedInputs.size
      ? (name: string) => this.lastChangedInputs.has(name)
      : () => true;

    Object.keys(inputs)
      .filter(ifInputChanged)
      .forEach((name) => compRef.setInput(name, inputs[name]));
  }

  private bindOutputs() {
    this._disconnectOutputs();

    const compInst = this.componentInst;
    let outputs = this.outputs;

    if (!outputs || !compInst) {
      return;
    }

    outputs = this._resolveOutputs(outputs);

    Object.keys(outputs)
      .filter((p) => compInst[p])
      .forEach((p) =>
        (compInst[p] as Observable<unknown>)
          .pipe(takeUntil(this.outputsShouldDisconnect$))
          .subscribe((event) => {
            this.cdr.markForCheck();
            return (outputs[p] as EventHandler)(event);
          }),
      );
  }

  private _disconnectOutputs() {
    this.outputsShouldDisconnect$.next();
  }

  private _getInputsChanges(): KeyValueChangesAny {
    return this.inputsDiffer.diff(this.inputs);
  }

  private _updateChangedInputs(differ: KeyValueChangesAny) {
    this.lastChangedInputs.clear();

    const addRecordKeyToSet = (record: KeyValueChangeRecord<string, unknown>) =>
      this.lastChangedInputs.add(record.key);

    differ.forEachAddedItem(addRecordKeyToSet);
    differ.forEachChangedItem(addRecordKeyToSet);
    differ.forEachRemovedItem(addRecordKeyToSet);
  }

  // TODO: Replace ComponentFactory once new API is created
  // @see https://github.com/angular/angular/issues/44926
  // eslint-disable-next-line deprecation/deprecation
  private _resolveCompFactory(): ComponentFactory<unknown> | null {
    try {
      try {
        return this.cfr.resolveComponentFactory(this.compRef.componentType);
      } catch (e) {
        // Fallback if componentType does not exist (happens on NgComponentOutlet)
        return this.cfr.resolveComponentFactory(
          this.compRef.instance.constructor as Type<unknown>,
        );
      }
    } catch (e) {
      // Factory not available - bailout
      return null;
    }
  }

  private _updateCompFactory() {
    this.compFactory = this._resolveCompFactory();
  }

  private _resolveOutputs(outputs: OutputsType): OutputsType {
    this._updateOutputsEventContext();

    outputs = this._processOutputs(outputs);

    if (!this.compFactory) {
      return outputs;
    }

    return this._remapIO(outputs, this.compFactory.outputs);
  }

  private _updateOutputsEventContext() {
    this.outputsEventContext = undefined;

    if (this.eventContextProvider) {
      // Resolve custom context from local provider
      const eventContextInjector = Injector.create({
        name: 'EventContext',
        parent: this.injector,
        providers: [this.eventContextProvider],
      });

      this.outputsEventContext = eventContextInjector.get(IoEventContextToken);
    } else {
      // Try to get global context
      this.outputsEventContext = this.injector.get(IoEventContextToken, null);
    }
  }

  private _processOutputs(outputs: OutputsType): OutputsTypeProcessed {
    const processedOutputs: OutputsTypeProcessed = {};

    Object.keys(outputs).forEach((key) => {
      const outputExpr = outputs[key];

      if (typeof outputExpr === 'function') {
        processedOutputs[key] = outputExpr;
      } else {
        processedOutputs[key] =
          outputExpr && this._processOutputArgs(outputExpr);
      }
    });

    return processedOutputs;
  }

  private _processOutputArgs(output: OutputWithArgs): EventHandler {
    const args = 'args' in output ? output.args || [] : [this.eventArgument];
    let handler: AnyFunction = output.handler;

    if (this.outputsEventContext) {
      handler = handler.bind(this.outputsEventContext);
    }

    // When no arguments specified - ignore arguments
    if (args.length === 0) {
      return () => handler();
    }

    return (event) =>
      handler(...args.map((arg) => (arg === this.eventArgument ? event : arg)));
  }

  private _remapIO<T extends Record<string, unknown>>(
    io: T,
    mapping: IOMappingList,
  ): T {
    const newIO = {};

    Object.keys(io).forEach((key) => {
      const newKey = this._findPropByTplInMapping(key, mapping) || key;
      newIO[newKey] = io[key];
    });

    return newIO as T;
  }

  private _findPropByTplInMapping(
    tplName: string,
    mapping: IOMappingList,
  ): string | null {
    for (const map of mapping) {
      if (map.templateName === tplName) {
        return map.propName;
      }
    }
    return null;
  }
}
