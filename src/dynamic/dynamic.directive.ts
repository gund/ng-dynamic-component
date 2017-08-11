import { NgComponentOutlet } from '@angular/common';
import {
  Directive,
  DoCheck,
  Host,
  Inject,
  Injector,
  Input,
  KeyValueChangeRecord,
  KeyValueDiffers,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
  SkipSelf,
  TemplateRef,
} from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { CustomSimpleChange, UNINITIALIZED } from './custom-simple-change';

export type KeyValueChangeRecordAny = KeyValueChangeRecord<any, any>;

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
  private _inputsDiffer = this._differs.find({}).create(null as any);
  private _destroyed$ = new Subject<void>();

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

  constructor(
    private _differs: KeyValueDiffers,
    private _injector: Injector,
    @Inject(COMPONENT_INJECTOR) private _componentInjectorType: ComponentInjector,
    @Host() @Optional() private _componentOutlet: NgComponentOutlet,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this._componentInstChanged) {
      this.updateInputs(true);
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

    const inputsChanges = this._inputsDiffer.diff(inputs);

    if (inputsChanges) {
      const isNotFirstChange = !!this._lastInputChanges;
      this._lastInputChanges = this._collectChangesFromDiffer(inputsChanges);

      if (isNotFirstChange) {
        this.updateInputs();
      }
    }
  }

  ngOnDestroy() {
    this._destroyed$.next();
  }

  updateInputs(isFirstChange = false) {
    const inputs = this._inputs;

    if (!inputs || !this._componentInst) {
      return;
    }

    Object.keys(inputs).forEach(p =>
      this._componentInst[p] = inputs[p]);

    this.notifyOnInputChanges(this._lastInputChanges, isFirstChange);
  }

  bindOutputs() {
    this._destroyed$.next();
    const outputs = this._outputs;

    if (!outputs || !this._componentInst) {
      return;
    }

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

  private _collectFirstChanges(): SimpleChanges {
    const changes = {} as SimpleChanges;
    const inputs = this._inputs;

    Object.keys(inputs).forEach(prop =>
      changes[prop] = new CustomSimpleChange(UNINITIALIZED, inputs[prop], true));

    return changes;
  }

  private _collectChangesFromDiffer(differ: any): SimpleChanges {
    const changes = {} as SimpleChanges;

    differ.forEachItem((record: KeyValueChangeRecordAny) =>
      changes[record.key] = new CustomSimpleChange(record.previousValue, record.currentValue, false));

    differ.forEachAddedItem((record: KeyValueChangeRecordAny) =>
      changes[record.key].previousValue = UNINITIALIZED);

    return changes;
  }

  private _extractCompFrom(outlet: NgComponentOutlet | null): any {
    return outlet && (<any>outlet)._componentRef && (<any>outlet)._componentRef.instance;
  }

}
