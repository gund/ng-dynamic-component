import {
  Directive,
  DoCheck,
  Inject,
  Input,
  KeyValueChanges,
  KeyValueDiffers,
  Optional,
  Renderer2,
  Type,
} from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';

/**
 * @public
 */
export interface AttributesMap {
  [key: string]: string;
}

interface AttributeActions {
  set: AttributesMap;
  remove: string[];
}

/**
 * @public
 */
@Directive({
  selector: '[ndcDynamicAttributes],[ngComponentOutletNdcDynamicAttributes]',
  exportAs: 'ndcDynamicAttributes',
})
export class DynamicAttributesDirective implements DoCheck {
  @Input()
  ndcDynamicAttributes?: AttributesMap | null;
  @Input()
  ngComponentOutletNdcDynamicAttributes?: AttributesMap | null;

  private attrsDiffer = this.differs.find({}).create<string, string>();
  private lastCompType?: Type<unknown>;
  private lastAttrActions?: AttributeActions;

  private get _attributes() {
    return (
      this.ndcDynamicAttributes ||
      this.ngComponentOutletNdcDynamicAttributes ||
      {}
    );
  }

  private get nativeElement() {
    return this.componentInjector?.componentRef?.location.nativeElement;
  }

  private get compType() {
    return this.componentInjector?.componentRef?.componentType;
  }

  private get isCompChanged() {
    if (this.lastCompType !== this.compType) {
      this.lastCompType = this.compType;
      return true;
    }
    return false;
  }

  constructor(
    private renderer: Renderer2,
    private differs: KeyValueDiffers,
    @Inject(DynamicComponentInjectorToken)
    @Optional()
    private componentInjector?: DynamicComponentInjector,
  ) {}

  ngDoCheck(): void {
    const isCompChanged = this.isCompChanged;
    const changes = this.attrsDiffer.diff(this._attributes);

    if (changes) {
      this.lastAttrActions = this.changesToAttrActions(changes);
    }

    if (changes || (isCompChanged && this.lastAttrActions)) {
      this.updateAttributes(this.lastAttrActions);
    }
  }

  setAttribute(name: string, value: string, namespace?: string) {
    if (this.nativeElement) {
      this.renderer.setAttribute(this.nativeElement, name, value, namespace);
    }
  }

  removeAttribute(name: string, namespace?: string) {
    if (this.nativeElement) {
      this.renderer.removeAttribute(this.nativeElement, name, namespace);
    }
  }

  private updateAttributes(actions?: AttributeActions) {
    if (!this.compType || !actions) {
      return;
    }

    Object.keys(actions.set).forEach((key) =>
      this.setAttribute(key, actions.set[key]),
    );

    actions.remove.forEach((key) => this.removeAttribute(key));
  }

  private changesToAttrActions(
    changes: KeyValueChanges<string, string>,
  ): AttributeActions {
    const attrActions: AttributeActions = {
      set: {},
      remove: [],
    };

    changes.forEachAddedItem((r) => (attrActions.set[r.key] = r.currentValue!));
    changes.forEachChangedItem(
      (r) => (attrActions.set[r.key] = r.currentValue!),
    );
    changes.forEachRemovedItem((r) => attrActions.remove.push(r.key));

    return attrActions;
  }
}
