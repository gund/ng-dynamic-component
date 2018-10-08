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
} from '@angular/core';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { InputsType, IoService, OutputsType } from './io.service';

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

  private _componentInjector: ComponentInjector = this._injector.get(
    this._componentInjectorType,
    null,
  );

  private get _inputs() {
    return this.ndcDynamicInputs || this.ngComponentOutletNdcDynamicInputs;
  }

  private get _outputs() {
    return this.ndcDynamicOutputs || this.ngComponentOutletNdcDynamicOutputs;
  }

  private get _compInjector() {
    return this._componentOutletInjector || this._componentInjector;
  }

  constructor(
    private _injector: Injector,
    private ioService: IoService,
    @Inject(COMPONENT_INJECTOR)
    private _componentInjectorType: ComponentInjector,
    @Host()
    @Optional()
    private _componentOutletInjector: ComponentOutletInjectorDirective,
  ) {
    this.ioService.init(this._compInjector);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ioService.update(
      this._inputs,
      this._outputs,
      this._inputsChanged(changes),
      this._outputsChanged(changes),
    );
  }

  ngDoCheck() {
    this.ioService.maybeUpdate();
  }

  private _inputsChanged(changes: SimpleChanges): boolean {
    return (
      'ngComponentOutletNdcDynamicInputs' in changes ||
      'ndcDynamicInputs' in changes
    );
  }

  private _outputsChanged(changes: SimpleChanges): boolean {
    return (
      'ngComponentOutletNdcDynamicOutputs' in changes ||
      'ndcDynamicOutputs' in changes
    );
  }
}
