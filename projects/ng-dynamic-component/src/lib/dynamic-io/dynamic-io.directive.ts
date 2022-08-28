import { Directive, DoCheck, Input } from '@angular/core';

import { InputsType, IoService, OutputsType } from '../io';

/* eslint-disable @angular-eslint/no-conflicting-lifecycle */

@Directive({
  selector: '[ndcDynamicInputs],[ndcDynamicOutputs]',
  exportAs: 'ndcDynamicIo',
  providers: [IoService],
})
export class DynamicIoDirective implements DoCheck {
  @Input()
  ndcDynamicInputs: InputsType;
  @Input()
  ndcDynamicOutputs: OutputsType;

  constructor(private ioService: IoService) {}

  ngDoCheck() {
    this.ioService.update(this.ndcDynamicInputs, this.ndcDynamicOutputs);
  }
}
