import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  StaticProvider,
  Type,
  ViewContainerRef,
} from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from './component-injector';

@Component({
  selector: 'ndc-dynamic',
  template: '',
  providers: [
    { provide: DynamicComponentInjectorToken, useExisting: DynamicComponent },
  ],
})
export class DynamicComponent implements OnChanges, DynamicComponentInjector {
  @Input()
  ndcDynamicComponent: Type<any>;
  @Input()
  ndcDynamicInjector: Injector;
  @Input()
  ndcDynamicProviders: StaticProvider[];
  @Input()
  ndcDynamicContent: any[][];

  @Output()
  ndcDynamicCreated: EventEmitter<ComponentRef<any>> = new EventEmitter();

  componentRef: ComponentRef<any> | null;

  constructor(
    private vcr: ViewContainerRef,
    private cfr: ComponentFactoryResolver,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ndcDynamicComponent) {
      this.createDynamicComponent();
    }
  }

  createDynamicComponent() {
    this.vcr.clear();
    this.componentRef = null;

    if (this.ndcDynamicComponent) {
      this.componentRef = this.vcr.createComponent(
        this.cfr.resolveComponentFactory(this.ndcDynamicComponent),
        0,
        this._resolveInjector(),
        this.ndcDynamicContent,
      );
      this.ndcDynamicCreated.emit(this.componentRef);
    }
  }

  private _resolveInjector(): Injector {
    let injector = this.ndcDynamicInjector || this.vcr.injector;

    if (this.ndcDynamicProviders) {
      injector = Injector.create({
        providers: this.ndcDynamicProviders,
        parent: injector,
      });
    }

    return injector;
  }
}
