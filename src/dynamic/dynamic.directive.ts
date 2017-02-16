import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { CustomSimpleChange, UNINITIALIZED } from './custom-simple-change';
import {
  Directive,
  DoCheck,
  Inject,
  Injector,
  Input,
  KeyValueChangeRecord,
  KeyValueDiffers,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Subject } from 'rxjs/Subject';

export type KeyValueChangeRecordAny = KeyValueChangeRecord<any, any>;

@Directive({
  selector: '[ndcDynamic], ndc-dynamic'
})
export class DynamicDirective implements OnChanges, DoCheck, OnDestroy {

  @Input() ndcDynamicInputs: { [k: string]: any } = {};
  @Input() ndcDynamicOutputs: { [k: string]: Function } = {};

  private _componentInjector: ComponentInjector = this._injector.get(this._componentInjectorType);
  private _lastComponentInst: any = this._componentInjector;
  private _lastInputChanges: SimpleChanges;
  private _inputsDiffer = this._differs.find(this.ndcDynamicInputs).create(null);
  private _destroyed$ = new Subject<void>();

  private get _componentInst(): any {
    return this._componentInjector.componentRef && this._componentInjector.componentRef.instance;
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
    @Inject(COMPONENT_INJECTOR) private _componentInjectorType: ComponentInjector
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

    const inputsChanges = this._inputsDiffer.diff(this.ndcDynamicInputs);

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
    Object.keys(this.ndcDynamicInputs).forEach(p =>
      this._componentInst[p] = this.ndcDynamicInputs[p]);

    this.notifyOnInputChanges(this._lastInputChanges, isFirstChange);
  }

  bindOutputs() {
    this._destroyed$.next();

    Object.keys(this.ndcDynamicOutputs)
      .filter(p => this._componentInst[p])
      .forEach(p => this._componentInst[p]
        .takeUntil(this._destroyed$)
        .subscribe(this.ndcDynamicOutputs[p]));
  }

  notifyOnInputChanges(changes: SimpleChanges, forceFirstChanges: boolean) {
    if (forceFirstChanges) {
      changes = this._collectFirstChanges();
    }

    if (changes) {
      this._componentInst.ngOnChanges(changes);
    }
  }

  private _collectFirstChanges(): SimpleChanges {
    const changes = {} as SimpleChanges;

    Object.keys(this.ndcDynamicInputs).forEach(prop =>
      changes[prop] = new CustomSimpleChange(UNINITIALIZED, this.ndcDynamicInputs[prop], true));

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

}
