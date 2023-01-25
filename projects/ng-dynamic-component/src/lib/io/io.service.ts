import {
  ChangeDetectorRef,
  ComponentFactory,
  ComponentFactoryResolver,
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
import { EventHandler, InputsType, OutputsType, OutputWithArgs } from './types';

interface IOMapInfo {
  propName: string;
  templateName: string;
}

type IOMappingList = IOMapInfo[];

type KeyValueChangesAny = KeyValueChanges<string, unknown>;

interface OutputsTypeProcessed extends OutputsType {
  [k: string]: EventHandler;
}

/**
 * @public
 */
@Injectable({ providedIn: 'root' })
export class IoServiceOptions {
  trackOutputChanges = false;
}

/**
 * @public
 */
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

  private inputs: InputsType = {};
  private outputs: OutputsType = {};
  private outputsChanged: (outputs: OutputsType) => boolean = () => false;

  private get compRef() {
    return this.compInjector.componentRef;
  }

  private get componentInst(): Record<string, unknown> | null {
    return this.compRef ? this.compRef.instance : (null as any);
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
    this.disconnectOutputs();
  }

  /**
   * Call update whenever inputs/outputs may or did change.
   *
   * It will detect both new and mutated changes.
   */
  update(inputs?: InputsType | null, outputs?: OutputsType | null) {
    if (!this.compRef) {
      this.disconnectOutputs();
      return;
    }

    const changes = this.updateIO(inputs, outputs);

    const compChanged = this.componentInstChanged;

    const inputsChanges = this.getInputsChanges(compChanged);
    const outputsChanged = this.outputsChanged(this.outputs);

    if (inputsChanges) {
      this.updateChangedInputs(inputsChanges);
    }

    if (compChanged || inputsChanges) {
      this.updateInputs(compChanged || !this.lastChangedInputs.size);
    }

    if (compChanged || outputsChanged || changes.outputsChanged) {
      this.bindOutputs();
    }
  }

  private updateIO(inputs?: InputsType | null, outputs?: OutputsType | null) {
    if (!inputs) {
      inputs = {};
    }
    if (!outputs) {
      outputs = {};
    }

    const inputsChanged = this.inputs !== inputs;
    const outputsChanged = this.outputs !== outputs;

    this.inputs = inputs;
    this.outputs = outputs;

    return { inputsChanged, outputsChanged };
  }

  private updateInputs(isFirstChange = false) {
    if (isFirstChange) {
      this.updateCompFactory();
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
    this.disconnectOutputs();

    const compInst = this.componentInst;
    let outputs = this.outputs;

    if (!outputs || !compInst) {
      return;
    }

    outputs = this.resolveOutputs(outputs);

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

  private disconnectOutputs() {
    this.outputsShouldDisconnect$.next();
  }

  private getInputsChanges(isCompChanged: boolean) {
    if (isCompChanged) {
      this.inputsDiffer.diff({});
    }

    return this.inputsDiffer.diff(this.inputs);
  }

  private updateChangedInputs(differ: KeyValueChangesAny) {
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
  private resolveCompFactory(): ComponentFactory<unknown> | null {
    if (!this.compRef) {
      return null;
    }

    try {
      try {
        return this.cfr.resolveComponentFactory(this.compRef.componentType);
      } catch (e) {
        // Fallback if componentType does not exist (happens on NgComponentOutlet)
        return this.cfr.resolveComponentFactory(
          (this.compRef.instance as any).constructor as Type<unknown>,
        );
      }
    } catch (e) {
      // Factory not available - bailout
      return null;
    }
  }

  private updateCompFactory() {
    this.compFactory = this.resolveCompFactory();
  }

  private resolveOutputs(outputs: OutputsType): OutputsType {
    this.updateOutputsEventContext();

    outputs = this.processOutputs(outputs);

    if (!this.compFactory) {
      return outputs;
    }

    return this.remapIO(outputs, this.compFactory.outputs);
  }

  private updateOutputsEventContext() {
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

  private processOutputs(outputs: OutputsType): OutputsTypeProcessed {
    const processedOutputs: OutputsTypeProcessed = {};

    Object.keys(outputs).forEach((key) => {
      const outputExpr = outputs[key]!;
      let outputHandler: EventHandler<unknown>;

      if (typeof outputExpr === 'function') {
        outputHandler = outputExpr;
      } else {
        outputHandler = outputExpr && this.processOutputArgs(outputExpr);
      }

      if (this.outputsEventContext && outputHandler) {
        outputHandler = outputHandler.bind(this.outputsEventContext);
      }

      processedOutputs[key] = outputHandler;
    });

    return processedOutputs;
  }

  private processOutputArgs(output: OutputWithArgs): EventHandler {
    const eventArgument = this.eventArgument;
    const args = 'args' in output ? output.args || [] : [eventArgument];
    const eventIdx = args.indexOf(eventArgument);
    const handler = output.handler;

    // When there is no event argument - use just arguments
    if (eventIdx === -1) {
      return function (this: unknown) {
        return handler.apply(this, args);
      };
    }

    return function (this: unknown, event) {
      const argsWithEvent = [...args];
      argsWithEvent[eventIdx] = event;

      return handler.apply(this, argsWithEvent);
    };
  }

  private remapIO<T extends Record<string, unknown>>(
    io: T,
    mapping: IOMappingList,
  ): T {
    const newIO: Record<string, unknown> = {};

    Object.keys(io).forEach((key) => {
      const newKey = this.findPropByTplInMapping(key, mapping) || key;
      newIO[newKey] = io[key];
    });

    return newIO as T;
  }

  private findPropByTplInMapping(
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
