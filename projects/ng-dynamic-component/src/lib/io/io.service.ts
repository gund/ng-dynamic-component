import {
  ChangeDetectorRef,
  ComponentFactory,
  ComponentFactoryResolver,
  Injectable,
  KeyValueChanges,
  KeyValueDiffers,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DynamicComponentInjector } from '../component-injector';
import { changesFromRecord, createNewChange, noop } from '../util';

export interface InputsType {
  [k: string]: any;
}
export interface OutputsType {
  // tslint:disable-next-line: ban-types
  [k: string]: Function;
}
export interface IOMapInfo {
  propName: string;
  templateName: string;
}
export type IOMappingList = IOMapInfo[];
export type KeyValueChangesAny = KeyValueChanges<any, any>;

export interface IoInitOptions {
  trackOutputChanges?: boolean;
}

const recordToChanges = changesFromRecord({ isFirstChanges: true });
const recordToNewChanges = changesFromRecord({ onlyNewChanges: true });

@Injectable()
export class IoService implements OnDestroy {
  private checkInit = this.failInit;

  private lastComponentInst: any = null;
  private lastInputChanges: SimpleChanges;
  private inputsDiffer = this.differs.find({}).create();
  private compFactory: ComponentFactory<any> | null = null;
  private outputsShouldDisconnect$ = new Subject<void>();

  private inputs: InputsType;
  private outputs: OutputsType;
  private compInjector: DynamicComponentInjector;
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

  private get compCdr(): ChangeDetectorRef {
    // tslint:disable-next-line: deprecation
    return this.compRef ? this.compRef.injector.get(ChangeDetectorRef) : null;
  }

  constructor(
    private differs: KeyValueDiffers,
    private cfr: ComponentFactoryResolver,
  ) {}

  ngOnDestroy(): void {
    this._disconnectOutputs();
  }

  init(
    componentInjector: DynamicComponentInjector,
    options: IoInitOptions = {},
  ) {
    this.checkInit = componentInjector ? noop : this.failInit;
    this.compInjector = componentInjector;

    if (options.trackOutputChanges) {
      const outputsDiffer = this.differs.find({}).create();
      this.outputsChanged = outputs => !!outputsDiffer.diff(outputs);
    }
  }

  update(
    inputs: InputsType,
    outputs: OutputsType,
    inputsChanged: boolean,
    outputsChanged: boolean,
  ) {
    this.checkInit();
    this.updateIO(inputs, outputs);

    const compChanged = this.componentInstChanged;

    if (compChanged || inputsChanged) {
      const inputsChanges = this._getInputsChanges(this.inputs);
      if (inputsChanges) {
        this._updateInputChanges(inputsChanges);
      }
      this.updateInputs(compChanged || !this.lastInputChanges);
    }

    if (compChanged || outputsChanged) {
      this.bindOutputs();
    }
  }

  maybeUpdate() {
    this.checkInit();

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

    const inputsChanges = this._getInputsChanges(this.inputs);

    if (inputsChanges) {
      const isNotFirstChange = !!this.lastInputChanges;
      this._updateInputChanges(inputsChanges);

      if (isNotFirstChange) {
        this.updateInputs();
      }
    }
  }

  private updateIO(inputs: InputsType, outputs: OutputsType) {
    this.inputs = inputs;
    this.outputs = outputs;
  }

  private updateInputs(isFirstChange = false) {
    if (isFirstChange) {
      this._updateCompFactory();
    }

    const compInst = this.componentInst;
    let inputs = this.inputs;

    if (!inputs || !compInst) {
      return;
    }

    inputs = this._resolveInputs(inputs);

    Object.keys(inputs).forEach(p => (compInst[p] = inputs[p]));

    // Mark component for check to re-render with new inputs
    if (this.compCdr) {
      this.compCdr.markForCheck();
    }

    this.notifyOnInputChanges(this.lastInputChanges, isFirstChange);
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
      .filter(p => compInst[p])
      .forEach(p =>
        compInst[p]
          .pipe(takeUntil(this.outputsShouldDisconnect$))
          .subscribe(outputs[p]),
      );
  }

  private notifyOnInputChanges(
    changes: SimpleChanges = {},
    forceFirstChanges: boolean,
  ) {
    // Exit early if component not interested to receive changes
    if (!this.componentInst.ngOnChanges) {
      return;
    }

    if (forceFirstChanges) {
      changes = this._collectFirstChanges();
    }

    this.componentInst.ngOnChanges(changes);
  }

  private _disconnectOutputs() {
    this.outputsShouldDisconnect$.next();
  }

  private _getInputsChanges(inputs: any): KeyValueChangesAny {
    return this.inputsDiffer.diff(this.inputs);
  }

  private _updateInputChanges(differ: KeyValueChangesAny) {
    this.lastInputChanges = this._collectChangesFromDiffer(differ);
  }

  private _collectFirstChanges(): SimpleChanges {
    const changes = {} as SimpleChanges;
    const inputs = this.inputs;

    Object.keys(inputs).forEach(
      prop => (changes[prop] = createNewChange(inputs[prop])),
    );

    return this._resolveChanges(changes);
  }

  private _collectChangesFromDiffer(differ: KeyValueChangesAny): SimpleChanges {
    const changes = {} as SimpleChanges;

    differ.forEachAddedItem(recordToChanges(changes));
    differ.forEachItem(recordToNewChanges(changes));

    return this._resolveChanges(changes);
  }

  private _resolveCompFactory(): ComponentFactory<any> | null {
    try {
      try {
        return this.cfr.resolveComponentFactory(this.compRef.componentType);
      } catch (e) {
        // Fallback if componentType does not exist (happens on NgComponentOutlet)
        return this.cfr.resolveComponentFactory(
          this.compRef.instance.constructor,
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

  private _resolveInputs(inputs: any): any {
    if (!this.compFactory) {
      return inputs;
    }

    return this._remapIO(inputs, this.compFactory.inputs);
  }

  private _resolveOutputs(outputs: any): any {
    if (!this.compFactory) {
      return outputs;
    }

    return this._remapIO(outputs, this.compFactory.outputs);
  }

  private _resolveChanges(changes: SimpleChanges): SimpleChanges {
    if (!this.compFactory) {
      return changes;
    }

    return this._remapIO(changes, this.compFactory.inputs);
  }

  private _remapIO(io: any, mapping: IOMappingList): any {
    const newIO = {};

    Object.keys(io).forEach(key => {
      const newKey = this._findPropByTplInMapping(key, mapping) || key;
      newIO[newKey] = io[key];
    });

    return newIO;
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

  private failInit() {
    throw Error(
      'IoService: ComponentInjector was not set! Please call init() method!',
    );
  }
}
