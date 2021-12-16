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
  @Input()
  ndcDynamicComponent: Type<C>;
  @Input()
  ndcDynamicInjector: Injector;
  @Input()
  ndcDynamicProviders: StaticProvider[];
  @Input()
  ndcDynamicContent: any[][];

  @Output()
  ndcDynamicCreated: EventEmitter<ComponentRef<C>> = new EventEmitter();

  componentRef: ComponentRef<C> | null;

  constructor(private vcr: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ndcDynamicComponent) {
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
