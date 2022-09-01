import { Directive, DoCheck, Input } from '@angular/core';

import { InputsType, IoService, OutputsType } from '../io';

@Directive({
  selector:
    // eslint-disable-next-line @angular-eslint/directive-selector
    '[ngComponentOutletNdcDynamicInputs],[ngComponentOutletNdcDynamicOutputs]',
  exportAs: 'ndcDynamicIo',
  providers: [IoService],
})
export class ComponentOutletIoDirective implements DoCheck {
  @Input()
  ngComponentOutletNdcDynamicInputs?: InputsType | null;
  @Input()
  ngComponentOutletNdcDynamicOutputs?: OutputsType | null;

  constructor(private ioService: IoService) {}

  ngDoCheck() {
    this.ioService.update(
      this.ngComponentOutletNdcDynamicInputs,
      this.ngComponentOutletNdcDynamicOutputs,
    );
  }
}
