import {
  Directive,
  DoCheck,
  Host,
  Inject,
  Injector,
  Input,
  KeyValueChanges,
  KeyValueDiffers,
  Optional,
  Renderer2,
  Type,
} from '@angular/core';

import { ComponentOutletInjectorDirective } from '../component-injector/component-outlet-injector.directive';
import { DynamicComponentInjector, DynamicComponentInjectorToken } from '../component-injector/token';

export interface AttributesMap {
  [key: string]: string;
}

interface AttributeActions {
  set: AttributesMap;
  remove: string[];
}

@Directive({
  selector: '[ndcDynamicAttributes],[ngComponentOutletNdcDynamicAttributes]',
  exportAs: 'ndcDynamicAttributes',
})
export class DynamicAttributesDirective implements DoCheck {
  @Input()
  ndcDynamicAttributes: AttributesMap;
  @Input()
  ngComponentOutletNdcDynamicAttributes: AttributesMap;

  private attrsDiffer = this.differs.find({}).create<string, string>();
  private lastCompType: Type<any>;
  private lastAttrActions: AttributeActions;

  private get _attributes() {
    return (
      this.ndcDynamicAttributes || this.ngComponentOutletNdcDynamicAttributes
    );
  }

  private get _compInjector() {
    return this.componentOutletInjector || this.componentInjector;
  }

  private get _nativeElement() {
    return (
      this._compInjector.componentRef &&
      this._compInjector.componentRef.location.nativeElement
    );
  }

  private get _compType() {
    return (
      this._compInjector.componentRef &&
      this._compInjector.componentRef.componentType
    );
  }

  private get _isCompChanged() {
    if (this.lastCompType !== this._compType) {
      this.lastCompType = this._compType;
      return true;
    }
    return false;
  }

  constructor(
    private renderer: Renderer2,
    private differs: KeyValueDiffers,
    private injector: Injector,
    @Inject(DynamicComponentInjectorToken)
    @Optional()
    private componentInjector?: DynamicComponentInjector,
    @Host()
    @Optional()
    private componentOutletInjector?: ComponentOutletInjectorDirective,
  ) {}

  ngDoCheck(): void {
    const isCompChanged = this._isCompChanged;
    const changes = this.attrsDiffer.diff(this._attributes);

    if (changes) {
      this.lastAttrActions = this._changesToAttrActions(changes);
    }

    if (changes || (isCompChanged && this.lastAttrActions)) {
      this._updateAttributes(this.lastAttrActions);
    }
  }

  setAttribute(name: string, value: string, namespace?: string) {
    if (this._nativeElement) {
      this.renderer.setAttribute(this._nativeElement, name, value, namespace);
    }
  }

  removeAttribute(name: string, namespace?: string) {
    if (this._nativeElement) {
      this.renderer.removeAttribute(this._nativeElement, name, namespace);
    }
  }

  private _updateAttributes(actions: AttributeActions) {
    // ? Early exit if no dynamic component
    if (!this._compType) {
      return;
    }

    Object.keys(actions.set).forEach(key =>
      this.setAttribute(key, actions.set[key]),
    );

    actions.remove.forEach(key => this.removeAttribute(key));
  }

  private _changesToAttrActions(
    changes: KeyValueChanges<string, string>,
  ): AttributeActions {
    const attrActions: AttributeActions = {
      set: {},
      remove: [],
    };

    changes.forEachAddedItem(r => (attrActions.set[r.key] = r.currentValue));
    changes.forEachChangedItem(r => (attrActions.set[r.key] = r.currentValue));
    changes.forEachRemovedItem(r => attrActions.remove.push(r.key));

    return attrActions;
  }
}
