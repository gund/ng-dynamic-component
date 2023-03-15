import { Directive, DoCheck, Input } from '@angular/core';

import { InputsType, IoService, OutputsType } from '../io';

/**
 * @public
 */
@Directive({
  selector: '[ndcDynamicInputs],[ndcDynamicOutputs]',
  exportAs: 'ndcDynamicIo',
  standalone: true,
  providers: [IoService],
})
export class DynamicIoDirective implements DoCheck {
  @Input()
  ndcDynamicInputs?: InputsType | null;
  @Input()
  ndcDynamicOutputs?: OutputsType | null;

  constructor(private ioService: IoService) {}

  ngDoCheck() {
    this.ioService.update(this.ndcDynamicInputs, this.ndcDynamicOutputs);
  }
}
