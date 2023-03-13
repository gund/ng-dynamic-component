import { Inject, Injectable, KeyValueDiffers } from '@angular/core';
import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';
import { IOData } from './io-data';
import { IoService } from './io.service';
import { EventHandler, InputsType, OutputsType } from './types';

@Injectable()
export class IoAdapterService {
  private ioDiffer = this.differs.find({}).create();

  private inputs: InputsType = {};
  private outputs: OutputsType = {};

  private get componentInst(): Record<string, unknown> {
    return (
      (this.compInjector.componentRef?.instance as Record<string, unknown>) ??
      {}
    );
  }

  constructor(
    private differs: KeyValueDiffers,
    private ioService: IoService,
    @Inject(DynamicComponentInjectorToken)
    private compInjector: DynamicComponentInjector,
  ) {}

  update(io?: IOData | null): void {
    if (!io) {
      io = {};
    }

    const ioChanges = this.ioDiffer.diff(io);

    if (!ioChanges) {
      return;
    }

    ioChanges.forEachRemovedItem((record) => {
      const name = this.getIOName(record.key);
      delete this.inputs[name];
      delete this.outputs[name];
    });

    ioChanges.forEachAddedItem((record) => {
      this.updateProp(record.key, record.currentValue);
    });

    ioChanges.forEachChangedItem((record) => {
      this.updateProp(record.key, record.currentValue);
    });

    this.ioService.update(this.inputs, this.outputs);
  }

  private getIOName(prop: string) {
    if (prop.startsWith('[') || prop.startsWith('(')) {
      return prop.slice(1, -1);
    }

    if (prop.startsWith('[(')) {
      return prop.slice(2, -2);
    }

    return prop;
  }

  private updateProp(prop: string, data: unknown) {
    if (this.maybeInputBind(prop, data, this.inputs)) {
      return;
    }

    if (this.maybeOutput(prop, data, this.outputs)) {
      return;
    }

    if (this.maybeInput2W(prop, data, this.inputs, this.outputs)) {
      return;
    }

    if (this.maybeInputProp(prop, data, this.inputs)) {
      return;
    }

    throw new Error(`IoAdapterService: Unknown binding type '${prop}!'`);
  }

  private maybeInputBind(prop: string, data: unknown, record: InputsType) {
    if (!prop.startsWith('[') || !prop.endsWith(']')) {
      return false;
    }

    const name = prop.slice(1, -1);

    if (typeof data === 'string' && data in this.componentInst) {
      this.addPropGetter(record, name);
      return true;
    }

    try {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
    } catch {
      throw new Error(
        `Input binding must be a string or valid JSON string but given ${typeof data}!`,
      );
    }

    record[name] = data;

    return true;
  }

  private maybeInputProp(prop: string, data: unknown, inputs: InputsType) {
    if (typeof data !== 'string') {
      throw new Error(`Input binding should be a string!`);
    }

    inputs[prop] = data;

    return true;
  }

  private maybeInput2W(
    prop: string,
    data: unknown,
    inputs: InputsType,
    outputs: OutputsType,
  ) {
    if (!prop.startsWith('[(') || !prop.endsWith(')]')) {
      return false;
    }

    if (typeof data !== 'string') {
      throw new Error(`Two-way binding must be a string!`);
    }

    const input = prop.slice(2, -2);
    const output = `${input}Change`;

    this.addPropGetter(inputs, input, data);

    outputs[output] = (value) => void (this.componentInst[data] = value);

    return true;
  }

  private maybeOutput(prop: string, data: unknown, record: OutputsType) {
    if (!prop.startsWith('(') || !prop.endsWith(')')) {
      return false;
    }

    const name = prop.slice(1, -1);

    if (typeof data === 'string' && data in this.componentInst) {
      this.addPropGetter(record, name);
      return true;
    }

    if (typeof data !== 'function') {
      throw new Error(`Output binding must be function or method name!`);
    }

    record[name] = data as EventHandler;

    return true;
  }

  private addPropGetter(
    obj: Record<string, unknown>,
    name: string,
    prop = name,
  ) {
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable: true,
      get: () => this.componentInst[prop],
    });
  }
}
