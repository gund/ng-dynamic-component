import {
  Directive,
  DoCheck,
  Host,
  Inject,
  Input,
  OnChanges,
  Optional,
  SimpleChanges,
} from '@angular/core';

import { ComponentOutletInjectorDirective } from '../component-injector/component-outlet-injector.directive';
import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector/token';
import { IoService } from '../io/io.service';
import { InputsType, OutputsType } from '../io/types';

// tslint:disable-next-line: no-conflicting-lifecycle
@Directive({
  selector:
    '[ndcDynamicInputs],[ndcDynamicOutputs],[ngComponentOutletNdcDynamicInputs],[ngComponentOutletNdcDynamicOutputs]',
  providers: [IoService],
})
export class DynamicIoDirective implements OnChanges, DoCheck {
  @Input()
  ndcDynamicInputs: InputsType;
  @Input()
  ngComponentOutletNdcDynamicInputs: InputsType;
  @Input()
  ndcDynamicOutputs: OutputsType;
  @Input()
  ngComponentOutletNdcDynamicOutputs: OutputsType;

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
    private ioService: IoService,
    @Inject(DynamicComponentInjectorToken)
    @Optional()
    private componentInjector?: DynamicComponentInjector,
    @Host()
    @Optional()
    private componentOutletInjector?: ComponentOutletInjectorDirective,
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
