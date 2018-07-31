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

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';

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
  @Input() ndcDynamicAttributes: AttributesMap;
  @Input() ngComponentOutletNdcDynamicAttributes: AttributesMap;

  private _attrsDiffer = this.differs.find({}).create<string, string>();
  private _componentInjector: ComponentInjector = this.injector.get(
    this.componentInjectorType,
    null,
  );
  private _lastCompType: Type<any>;
  private _lastAttrActions: AttributeActions;

  private get _attributes() {
    return (
      this.ndcDynamicAttributes || this.ngComponentOutletNdcDynamicAttributes
    );
  }

  private get _compInjector() {
    return this.componentOutletInjector || this._componentInjector;
  }

  private get _nativeElement() {
    return this._compInjector.componentRef ? this._compInjector.componentRef.location.nativeElement : null;
  }

  private get _compType() {
    return this._compInjector.componentRef ? this._compInjector.componentRef.componentType : null;
  }

  private get _isCompChanged() {
    if (this._lastCompType !== this._compType) {
      this._lastCompType = this._compType;
      return true;
    }
    return false;
  }

  constructor(
    private renderer: Renderer2,
    private differs: KeyValueDiffers,
    private injector: Injector,
    @Inject(COMPONENT_INJECTOR)
    private componentInjectorType: ComponentInjector,
    @Optional()
    @Host()
    private componentOutletInjector: ComponentOutletInjectorDirective,
  ) {}

  ngDoCheck(): void {
    const isCompChanged = this._isCompChanged;
    const changes = this._attrsDiffer.diff(this._attributes);

    if (changes) {
      this._lastAttrActions = this._changesToAttrActions(changes);
    }

    if (changes || (isCompChanged && this._lastAttrActions)) {
      this._updateAttributes(this._lastAttrActions);
    }
  }

  setAttribute(name: string, value: string, namespace?: string) {
    if (this._nativeElement) {
      this.renderer.setAttribute(this._nativeElement, name, value, namespace);
    }
  }

  removeAttribute(name: string, namespace?: string) {
    this.renderer.removeAttribute(this._nativeElement, name, namespace);
  }

  private _updateAttributes(actions: AttributeActions) {
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
