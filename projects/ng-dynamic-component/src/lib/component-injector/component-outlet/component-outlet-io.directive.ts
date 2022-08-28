import { Directive, DoCheck, Input } from '@angular/core';

import { InputsType, IoService, OutputsType } from '../../io';

@Directive({
  selector:
    // eslint-disable-next-line @angular-eslint/directive-selector
    '[ngComponentOutletNdcDynamicInputs],[ngComponentOutletNdcDynamicOutputs]',
  exportAs: 'ndcDynamicIo',
  providers: [IoService],
})
export class ComponentOutletIoDirective implements DoCheck {
  @Input()
  ngComponentOutletNdcDynamicInputs: InputsType;
  @Input()
  ngComponentOutletNdcDynamicOutputs: OutputsType;

  constructor(private ioService: IoService) {}

  ngDoCheck() {
    this.ioService.update(
      this.ngComponentOutletNdcDynamicInputs,
      this.ngComponentOutletNdcDynamicOutputs,
    );
  }
}
