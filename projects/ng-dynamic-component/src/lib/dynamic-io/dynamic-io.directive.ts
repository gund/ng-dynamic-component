import {
  Directive,
  DoCheck,
  Inject,
  Input,
  OnChanges,
  Optional,
  SimpleChanges,
} from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';
import { InputsType, IoService, OutputsType } from '../io';

/* eslint-disable @angular-eslint/no-conflicting-lifecycle */

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

  constructor(
    private ioService: IoService,
    @Inject(DynamicComponentInjectorToken)
    @Optional()
    private componentInjector?: DynamicComponentInjector,
  ) {
    this.ioService.init(this.componentInjector);
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
