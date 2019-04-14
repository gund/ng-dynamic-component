import {
  KeyValueChangeRecord,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';

export type KeyValueChangeRecordAny = KeyValueChangeRecord<any, any>;

export function createNewChange(val: any): SimpleChange {
  return new SimpleChange(undefined, val, true);
}

export function recordToChange(
  record: KeyValueChangeRecordAny,
  isFirstChange = false,
): SimpleChange {
  return isFirstChange
    ? createNewChange(record.currentValue)
    : new SimpleChange(record.previousValue, record.currentValue, false);
}

export function setChangeFromRecord(
  isFirstChanges: boolean,
  setter: (record: KeyValueChangeRecordAny, change: SimpleChange) => void,
) {
  return (record: KeyValueChangeRecordAny) =>
    setter(record, recordToChange(record, isFirstChanges));
}

function getChangesRecords(isFirstChanges: boolean) {
  return (changes: SimpleChanges) =>
    setChangeFromRecord(
      isFirstChanges,
      (record, change) => (changes[record.key] = change),
    );
}

function getNewChangesRecords(isFirstChanges: boolean) {
  return (changes: SimpleChanges) =>
    setChangeFromRecord(isFirstChanges, (record, change) => {
      if (!changes[record.key]) {
        changes[record.key] = change;
      }
    });
}

export const defaultOpts = {
  isFirstChanges: false,
  onlyNewChanges: false,
};

export type DefaultOpts = Partial<typeof defaultOpts>;

export function changesFromRecord(opts: DefaultOpts = defaultOpts) {
  return opts.onlyNewChanges
    ? getNewChangesRecords(opts.isFirstChanges)
    : getChangesRecords(opts.isFirstChanges);
}

export function noop(): void {}

export function getCtorType(
  ctor: any,
  reflect: { getMetadata: Function },
): any[] {
  return reflect.getMetadata('design:paramtypes', ctor);
}

export class Hashcache<K, V> {
  map: Map<K, V>;
  defaultCreator: (key: K) => V;

  constructor(creator: (key: K) => V) {
    this.defaultCreator = creator;
    this.map = new Map<K, V>();
  }

  get size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  entries(): IterableIterator<[K, V]> {
    return this.map.entries();
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any,
  ): void {
    this.map.forEach(callbackfn);
  }

  get(key: K): V {
    let value: V = this.map.get(key);

    if (!value) {
      value = this.defaultCreator(key);
      this.map.set(key, value);
    }

    return value;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  set(key: K, value: V): this {
    this.map.set(key, value);
    return this;
  }

  values(): IterableIterator<V> {
    return this.map.values();
  }
}
