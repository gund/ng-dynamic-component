import {
  ComponentFactory,
  ComponentFactoryResolver,
  Directive,
  DoCheck,
  Host,
  Inject,
  Injector,
  Input,
  KeyValueChanges,
  KeyValueDiffers,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { changesFromRecord, createNewChange } from './util';

export type IOMapInfo = { propName: string, templateName: string };
export type IOMappingList = IOMapInfo[];
export type KeyValueChangesAny = KeyValueChanges<any, any>;

const recordToChanges = changesFromRecord({ isFirstChanges: true });
const recordToNewChanges = changesFromRecord({ onlyNewChanges: true });

@Directive({
  selector: '[ndcDynamicInputs],[ndcDynamicOutputs],[ngComponentOutletNdcDynamicInputs],[ngComponentOutletNdcDynamicOutputs]'
})
export class DynamicDirective implements OnChanges, DoCheck, OnDestroy {

  @Input() ndcDynamicInputs: { [k: string]: any };
  @Input() ngComponentOutletNdcDynamicInputs: { [k: string]: any };
  @Input() ndcDynamicOutputs: { [k: string]: Function };
  @Input() ngComponentOutletNdcDynamicOutputs: { [k: string]: Function };

  private _componentInjector: ComponentInjector = this._injector.get(this._componentInjectorType, null);
  private _lastComponentInst: any = this._componentInjector;
  private _lastInputChanges: SimpleChanges;
  private _inputsDiffer = this._differs.find({}).create();
  private _compFactory: ComponentFactory<any> | null = null;
  private _outputsShouldDisconnect$ = new Subject<void>();

  private get _inputs() {
    return this.ndcDynamicInputs || this.ngComponentOutletNdcDynamicInputs;
  }

  private get _outputs() {
    return this.ndcDynamicOutputs || this.ngComponentOutletNdcDynamicOutputs;
  }

  private get _compInjector() {
    return this._componentOutletInjector || this._componentInjector;
  }

  private get _compRef() {
    return this._compInjector.componentRef;
  }

  private get _componentInst() {
    return this._compRef.instance;
  }

  private get _componentInstChanged(): boolean {
    if (this._lastComponentInst !== this._componentInst) {
      this._lastComponentInst = this._componentInst;
      return true;
    } else {
      return false;
    }
  }

  constructor(
    private _differs: KeyValueDiffers,
    private _injector: Injector,
    private _cfr: ComponentFactoryResolver,
    @Inject(COMPONENT_INJECTOR) private _componentInjectorType: ComponentInjector,
    @Host() @Optional() private _componentOutletInjector: ComponentOutletInjectorDirective,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    const compChanged = this._componentInstChanged;

    if (compChanged || this._inputsChanged(changes)) {
      const inputsChanges = this._getInputsChanges(this._inputs);

      if (inputsChanges) {
        this._updateInputChanges(inputsChanges);
      }

      this.updateInputs(compChanged || !this._lastInputChanges);
    }

    if (compChanged || this._outputsChanged(changes)) {
      this.bindOutputs();
    }
  }

  ngDoCheck() {
    if (this._componentInstChanged) {
      this.updateInputs(true);
      this.bindOutputs();
      return;
    }

    const inputs = this._inputs;

    if (!inputs) {
      return;
    }

    const inputsChanges = this._getInputsChanges(this._inputs);

    if (inputsChanges) {
      const isNotFirstChange = !!this._lastInputChanges;
      this._updateInputChanges(inputsChanges);

      if (isNotFirstChange) {
        this.updateInputs();
      }
    }
  }

  ngOnDestroy() {
    this._disconnectOutputs();
  }

  updateInputs(isFirstChange = false) {
    if (isFirstChange) {
      this._updateCompFactory();
    }

    const compInst = this._componentInst;
    let inputs = this._inputs;

    if (!inputs || !compInst) {
      return;
    }

    inputs = this._resolveInputs(inputs);

    Object
      .keys(inputs)
      .forEach(p => compInst[p] = inputs[p]);

    this.notifyOnInputChanges(this._lastInputChanges, isFirstChange);
  }

  bindOutputs() {
    this._disconnectOutputs();

    const compInst = this._componentInst;
    let outputs = this._outputs;

    if (!outputs || !compInst) {
      return;
    }

    outputs = this._resolveOutputs(outputs);

    Object.keys(outputs)
      .filter(p => compInst[p])
      .forEach(p => compInst[p]
        .pipe(takeUntil(this._outputsShouldDisconnect$))
        .subscribe(outputs[p]));
  }

  notifyOnInputChanges(changes: SimpleChanges = {}, forceFirstChanges: boolean) {
    // Exit early if component not interested to receive changes
    if (!this._componentInst.ngOnChanges) {
      return;
    }

    if (forceFirstChanges) {
      changes = this._collectFirstChanges();
    }

    this._componentInst.ngOnChanges(changes);
  }

  private _disconnectOutputs() {
    this._outputsShouldDisconnect$.next();
  }

  private _getInputsChanges(inputs: any): KeyValueChangesAny {
    return this._inputsDiffer.diff(this._inputs);
  }

  private _updateInputChanges(differ: KeyValueChangesAny) {
    this._lastInputChanges = this._collectChangesFromDiffer(differ);
  }

  private _collectFirstChanges(): SimpleChanges {
    const changes = {} as SimpleChanges;
    const inputs = this._inputs;

    Object.keys(inputs).forEach(prop =>
      changes[prop] = createNewChange(inputs[prop]));

    return this._resolveChanges(changes);
  }

  private _collectChangesFromDiffer(
    differ: KeyValueChangesAny
  ): SimpleChanges {
    const changes = {} as SimpleChanges;

    differ.forEachAddedItem(recordToChanges(changes));
    differ.forEachItem(recordToNewChanges(changes));

    return this._resolveChanges(changes);
  }

  private _inputsChanged(changes: SimpleChanges): boolean {
    return 'ngComponentOutletNdcDynamicInputs' in changes || 'ndcDynamicInputs' in changes;
  }

  private _outputsChanged(changes: SimpleChanges): boolean {
    return 'ngComponentOutletNdcDynamicOutputs' in changes || 'ndcDynamicOutputs' in changes;
  }

  private _resolveCompFactory(): ComponentFactory<any> | null {
    try {
      try {
        return this._cfr.resolveComponentFactory(this._compRef.componentType);
      } catch (e) {
        // Fallback if componentType does not exist (happens on NgComponentOutlet)
        return this._cfr.resolveComponentFactory(this._compRef.instance.constructor);
      }
    } catch (e) {
      // Factory not available - bailout
      return null;
    }
  }

  private _updateCompFactory() {
    this._compFactory = this._resolveCompFactory();
  }

  private _resolveInputs(inputs: any): any {
    if (!this._compFactory) {
      return inputs;
    }

    return this._remapIO(inputs, this._compFactory.inputs);
  }

  private _resolveOutputs(outputs: any): any {
    if (!this._compFactory) {
      return outputs;
    }

    return this._remapIO(outputs, this._compFactory.outputs);
  }

  private _resolveChanges(changes: SimpleChanges): SimpleChanges {
    if (!this._compFactory) {
      return changes;
    }

    return this._remapIO(changes, this._compFactory.inputs);
  }

  private _remapIO(io: any, mapping: IOMappingList): any {
    const newIO = {};

    Object.keys(io)
      .forEach(key => {
        const newKey = this._findPropByTplInMapping(key, mapping) || key;
        newIO[newKey] = io[key];
      });

    return newIO;
  }

  private _findPropByTplInMapping(tplName: string, mapping: IOMappingList): string | null {
    for (const map of mapping) {
      if (map.templateName === tplName) {
        return map.propName;
      }
    }
    return null;
  }

}
