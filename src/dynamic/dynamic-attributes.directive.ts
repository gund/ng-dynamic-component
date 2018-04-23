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
} from '@angular/core';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';

export interface AttributesMap {
  [key: string]: string;
}

@Directive({
  selector: '[ndcDynamicAttributes]',
  exportAs: 'ndcDynamicAttributes',
})
export class DynamicAttributesDirective implements DoCheck {
  @Input() ndcDynamicAttributes: AttributesMap;

  private _attrsDiffer = this.differs.find({}).create<string, string>();
  private _componentInjector: ComponentInjector = this.injector.get(
    this.componentInjectorType,
    null,
  );

  private get _compInjector() {
    return this.componentOutletInjector || this._componentInjector;
  }

  private get _nativeElement() {
    const compInjector = this._compInjector;

    if (!compInjector) {
      throw Error('ERROR: ndcDynamicAttributes: No Component Injector available!');
    }

    return compInjector.componentRef.location.nativeElement;
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
    const changes = this._attrsDiffer.diff(this.ndcDynamicAttributes);

    if (changes) {
      this._updateAttributes(changes);
    }
  }

  setAttribute(name: string, value: string, namespace?: string) {
    this.renderer.setAttribute(this._nativeElement, name, value, namespace);
  }

  removeAttribute(name: string, namespace?: string) {
    this.renderer.removeAttribute(this._nativeElement, name, namespace);
  }

  private _updateAttributes(changes: KeyValueChanges<string, string>) {
    changes.forEachAddedItem(r => this.setAttribute(r.key, r.currentValue));
    changes.forEachChangedItem(r => this.setAttribute(r.key, r.currentValue));
    changes.forEachRemovedItem(r => this.removeAttribute(r.key));
  }
}
