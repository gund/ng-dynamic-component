import { ComponentInjector } from './component-injector';
import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  Input,
  OnChanges,
  Provider,
  ReflectiveInjector,
  SimpleChanges,
  Type,
  ViewContainerRef
} from '@angular/core';

@Component({
  selector: 'ndc-dynamic',
  template: ''
})
export class DynamicComponent implements OnChanges, ComponentInjector {

  @Input() ndcDynamicComponent: Type<any>;
  @Input() ndcDynamicInjector: Injector;
  @Input() ndcDynamicProviders: Provider[];
  @Input() ndcDynamicContent: any[][];

  componentRef: ComponentRef<any>;

  constructor(
    private _vcr: ViewContainerRef,
    private _cfr: ComponentFactoryResolver
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appDynamicComponent']) {
      this.createDynamicComponent();
    }
  }

  createDynamicComponent() {
    this._vcr.clear();

    this.componentRef = this._vcr.createComponent(
      this._cfr.resolveComponentFactory(this.ndcDynamicComponent),
      0, this._resolveInjector(), this.ndcDynamicContent
    );
  }

  private _resolveInjector(): Injector {
    let injector = this.ndcDynamicInjector || this._vcr.parentInjector;

    if (this.ndcDynamicProviders) {
      injector = ReflectiveInjector.resolveAndCreate(this.ndcDynamicProviders, injector);
    }

    return injector;
  }

}
