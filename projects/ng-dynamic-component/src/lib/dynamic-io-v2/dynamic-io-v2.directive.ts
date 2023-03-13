/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import {
  Directive,
  DoCheck,
  Inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';
import { IoService } from '../io';
import { IoAdapterService } from '../io/io-adapter.service';
import { IOData } from '../io/io-data';
import { TemplateParser, TemplateTokeniser } from '../template';

@Directive({
  selector: '[ndcDynamicIo]',
  exportAs: 'ndcDynamicIo',
  providers: [IoService, IoAdapterService],
})
export class DynamicIoV2Directive implements DoCheck, OnChanges {
  @Input()
  ndcDynamicIo?: IOData | string | null;

  private get componentInst(): Record<string, unknown> {
    return (
      (this.compInjector.componentRef?.instance as Record<string, unknown>) ??
      {}
    );
  }

  constructor(
    private ioService: IoAdapterService,
    @Inject(DynamicComponentInjectorToken)
    private compInjector: DynamicComponentInjector,
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['ndcDynamicIo'] && typeof this.ndcDynamicIo === 'string') {
      this.updateIo(await this.strToIo(this.ndcDynamicIo));
    }
  }

  ngDoCheck() {
    if (typeof this.ndcDynamicIo !== 'string') {
      this.updateIo(this.ndcDynamicIo);
    }
  }

  private async updateIo(io?: IOData | null) {
    this.ioService.update(io);
  }

  private strToIo(ioStr: string) {
    const tokeniser = new TemplateTokeniser();
    const parser = new TemplateParser(tokeniser, this.componentInst);
    const ioPromise = parser.getIo();

    tokeniser.feed(ioStr);

    return ioPromise;
  }
}
