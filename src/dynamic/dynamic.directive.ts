import { NgComponentOutlet } from '@angular/common';
import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
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
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';

export type IOMapInfo = { propName: string, templateName: string };
export type IOMappingList = IOMapInfo[];
export type KeyValueChangesAny = KeyValueChanges<any, any>;

@Directive({
  selector: '[ndcDynamicInputs],[ndcDynamicOutputs],[ngComponentOutletNdcDynamicInputs],[ngComponentOutletNdcDynamicOutputs]'
})
export class DynamicDirective implements OnChanges, DoCheck, OnDestroy {

  @Input() ndcDynamicInputs: { [k: string]: any };
  @Input() ngComponentOutletNdcDynamicInputs: { [k: string]: any };
  @Input() ndcDynamicOutputs: { [k: string]: Function };
  @Input() ngComponentOutletNdcDynamicOutputs: { [k: string]: Function };

  private _componentInjector: ComponentInjector = this._injector.get(this._componentInjectorType, {});
  private _lastComponentInst: any = this._componentInjector;
  private _lastInputChanges: SimpleChanges;
  private _inputsDiffer = this._differs.find({}).create();
  private _destroyed$ = new Subject<void>();
  private _compFactory: ComponentFactory<any> | null = null;

  private get _inputs() {
    return this.ndcDynamicInputs || this.ngComponentOutletNdcDynamicInputs;
  }

  private get _outputs() {
    return this.ndcDynamicOutputs || this.ngComponentOutletNdcDynamicOutputs;
  }

  private get _compOutletInst(): any {
    return this._extractCompFrom(this._componentOutlet);
  }

  private get _componentInst(): any {
    return this._compOutletInst ||
      this._componentInjector.componentRef && this._componentInjector.componentRef.instance;
  }

  private get _componentInstChanged(): boolean {
    if (this._lastComponentInst !== this._componentInst) {
      this._lastComponentInst = this._componentInst;
      return true;
    } else {
      return false;
    }
  }

  private get _compRef(): ComponentRef<any> | null {
    return this._extractCompRefFrom(this._componentOutlet) || this._componentInjector.componentRef;
  }

  constructor(
    private _differs: KeyValueDiffers,
    private _injector: Injector,
    private _cfr: ComponentFactoryResolver,
    @Inject(COMPONENT_INJECTOR) private _componentInjectorType: ComponentInjector,
    @Host() @Optional() private _componentOutlet: NgComponentOutlet,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this._componentInstChanged) {
      this.updateInputs(true);
      this.bindOutputs();
    } else {
      if (this._inputsChanged(changes)) {
        this._updateInputChanges(this._getInputsChanges(this._inputs));
        this.updateInputs(!this._lastInputChanges);
      }

      if (this._outputsChanged(changes)) {
        this.bindOutputs();
      }
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
    this._destroyed$.next();
  }

  updateInputs(isFirstChange = false) {
    if (isFirstChange) {
      this._updateCompFactory();
    }

    let inputs = this._inputs;

    if (!inputs || !this._componentInst) {
      return;
    }

    inputs = this._resolveInputs(inputs);

    Object
      .keys(inputs)
      .forEach(p => this._componentInst[p] = inputs[p]);

    this.notifyOnInputChanges(this._lastInputChanges, isFirstChange);
  }

  bindOutputs() {
    this._destroyed$.next();
    let outputs = this._outputs;

    if (!outputs || !this._componentInst) {
      return;
    }

    outputs = this._resolveOutputs(outputs);

    Object.keys(outputs)
      .filter(p => this._componentInst[p])
      .forEach(p => this._componentInst[p]
        .takeUntil(this._destroyed$)
        .subscribe(outputs[p]));
  }

  notifyOnInputChanges(changes: SimpleChanges = {}, forceFirstChanges: boolean) {
    // Exit early if component not interrested to receive changes
    if (!this._componentInst.ngOnChanges) {
      return;
    }

    if (forceFirstChanges) {
      changes = this._collectFirstChanges();
    }

    this._componentInst.ngOnChanges(changes);
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
      changes[prop] = new SimpleChange(undefined, inputs[prop], true));

    return this._resolveChanges(changes);
  }

  private _collectChangesFromDiffer(
    differ: KeyValueChangesAny
  ): SimpleChanges {
    const changes = {} as SimpleChanges;

    differ.forEachAddedItem(record =>
      changes[record.key] =
      new SimpleChange(undefined, record.currentValue, true));

    differ.forEachItem(record => {
      if (!changes[record.key]) {
        changes[record.key] =
          new SimpleChange(record.previousValue, record.currentValue, false);
      }
    });

    return this._resolveChanges(changes);
  }

  private _inputsChanged(changes: SimpleChanges): boolean {
    return 'ngComponentOutletNdcDynamicInputs' in changes || 'ndcDynamicInputs' in changes;
  }

  private _outputsChanged(changes: SimpleChanges): boolean {
    return 'ngComponentOutletNdcDynamicOutputs' in changes || 'ndcDynamicOutputs' in changes;
  }

  private _extractCompRefFrom(outlet: NgComponentOutlet | null): ComponentRef<any> | null {
    return outlet && (<any>outlet)._componentRef;
  }

  private _extractCompFrom(outlet: NgComponentOutlet | null): any {
    const compRef = this._extractCompRefFrom(outlet);
    return compRef && compRef.instance;
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
