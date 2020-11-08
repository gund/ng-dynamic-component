import { Directive, DoCheck, Input, OnChanges } from '@angular/core';

import { InputsType, IoService, IoServiceProvider, OutputsType } from '../io';

/* eslint-disable @angular-eslint/no-conflicting-lifecycle */

@Directive({
  selector:
    '[ndcDynamicInputs],[ndcDynamicOutputs],[ngComponentOutletNdcDynamicInputs],[ngComponentOutletNdcDynamicOutputs]',
  providers: [IoServiceProvider],
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

  constructor(private ioService: IoService) {}

  ngOnChanges() {
    this.ioService.update(this.inputs, this.outputs);
  }

  ngDoCheck() {
    this.ioService.maybeUpdate();
  }
}
