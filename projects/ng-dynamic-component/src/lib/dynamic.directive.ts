import {
  Directive,
  DoCheck,
  Host,
  Inject,
  Injector,
  Input,
  OnChanges,
  Optional,
  SimpleChanges,
  Type,
} from '@angular/core';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { InputsType, IoService, OutputsType } from './io.service';

// tslint:disable-next-line: no-conflicting-lifecycle
@Directive({
  selector:
    '[ndcDynamicInputs],[ndcDynamicOutputs],[ngComponentOutletNdcDynamicInputs],[ngComponentOutletNdcDynamicOutputs]',
  providers: [IoService],
})
export class DynamicDirective implements OnChanges, DoCheck {
  @Input()
  ndcDynamicInputs: InputsType;
  @Input()
  ngComponentOutletNdcDynamicInputs: InputsType;
  @Input()
  ndcDynamicOutputs: OutputsType;
  @Input()
  ngComponentOutletNdcDynamicOutputs: OutputsType;

  private componentInjector = this.injector.get(
    this.componentInjectorType,
    null,
  );

  private get inputs() {
    return this.ndcDynamicInputs || this.ngComponentOutletNdcDynamicInputs;
  }

  private get outputs() {
    return this.ndcDynamicOutputs || this.ngComponentOutletNdcDynamicOutputs;
  }

  private get compInjector() {
    return this.componentOutletInjector || this.componentInjector;
  }

  constructor(
    private injector: Injector,
    private ioService: IoService,
    @Inject(COMPONENT_INJECTOR)
    private componentInjectorType: Type<ComponentInjector>,
    @Host()
    @Optional()
    private componentOutletInjector: ComponentOutletInjectorDirective,
  ) {
    this.ioService.init(this.compInjector);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ioService.update(
      this.inputs,
      this.outputs,
      this.inputsChanged(changes),
      this.outputsChanged(changes),
    );
  }

  ngDoCheck() {
    this.ioService.maybeUpdate();
  }

  private inputsChanged(changes: SimpleChanges): boolean {
    return (
      'ngComponentOutletNdcDynamicInputs' in changes ||
      'ndcDynamicInputs' in changes
    );
  }

  private outputsChanged(changes: SimpleChanges): boolean {
    return (
      'ngComponentOutletNdcDynamicOutputs' in changes ||
      'ndcDynamicOutputs' in changes
    );
  }
}
