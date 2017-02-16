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
  selector: 'app-dynamic',
  template: ''
})
export class DynamicComponent implements OnChanges, ComponentInjector {

  @Input() appDynamicComponent: Type<any>;
  @Input() appDynamicInjector: Injector;
  @Input() appDynamicProviders: Provider[];
  @Input() appDynamicContent: any[][];

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
      this._cfr.resolveComponentFactory(this.appDynamicComponent),
      0, this._resolveInjector(), this.appDynamicContent
    );
  }

  private _resolveInjector(): Injector {
    let injector = this.appDynamicInjector || this._vcr.parentInjector;

    if (this.appDynamicProviders) {
      injector = ReflectiveInjector.resolveAndCreate(this.appDynamicProviders, injector);
    }

    return injector;
  }

}
