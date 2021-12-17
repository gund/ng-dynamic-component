import {
  Component,
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
export class DynamicComponent<C = any>
  implements OnChanges, DynamicComponentInjector
{
  private static UpdateOnInputs: (keyof DynamicComponent)[] = [
    'ndcDynamicComponent',
    'ndcDynamicInjector',
    'ndcDynamicProviders',
    'ndcDynamicContent',
  ];

  @Input()
  ndcDynamicComponent?: Type<C> | null;
  @Input()
  ndcDynamicInjector?: Injector | null;
  @Input()
  ndcDynamicProviders?: StaticProvider[] | null;
  @Input()
  ndcDynamicContent?: any[][] | null;

  @Output()
  ndcDynamicCreated: EventEmitter<ComponentRef<C>> = new EventEmitter();

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
