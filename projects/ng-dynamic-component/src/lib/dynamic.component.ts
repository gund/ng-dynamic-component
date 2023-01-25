import {
  Component,
  ComponentRef,
  EnvironmentInjector,
  EventEmitter,
  Injector,
  Input,
  NgModuleRef,
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
export class DynamicComponent<C = unknown>
  implements OnChanges, DynamicComponentInjector
{
  private static UpdateOnInputs: (keyof DynamicComponent)[] = [
    'ndcDynamicComponent',
    'ndcDynamicInjector',
    'ndcDynamicProviders',
    'ndcDynamicContent',
    'ndcDynamicNgModuleRef',
    'ndcDynamicEnvironmentInjector',
  ];

  @Input()
  ndcDynamicComponent?: Type<C> | null;
  @Input()
  ndcDynamicInjector?: Injector | null;
  @Input()
  ndcDynamicProviders?: StaticProvider[] | null;
  @Input()
  ndcDynamicContent?: Node[][];
  @Input()
  ndcDynamicNgModuleRef?: NgModuleRef<unknown>;
  @Input()
  ndcDynamicEnvironmentInjector?: EnvironmentInjector | NgModuleRef<unknown>;

  @Output()
  ndcDynamicCreated = new EventEmitter<ComponentRef<C>>();

  componentRef: ComponentRef<C> | null = null;

  constructor(private vcr: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      DynamicComponent.UpdateOnInputs.some((input) =>
        changes.hasOwnProperty(input),
      )
    ) {
      this.createDynamicComponent();
    }
  }

  createDynamicComponent() {
    this.vcr.clear();
    this.componentRef = null;

    if (this.ndcDynamicComponent) {
      this.componentRef = this.vcr.createComponent(this.ndcDynamicComponent, {
        index: 0,
        injector: this._resolveInjector(),
        projectableNodes: this.ndcDynamicContent,
        ngModuleRef: this.ndcDynamicNgModuleRef,
        environmentInjector: this.ndcDynamicEnvironmentInjector,
      });
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
