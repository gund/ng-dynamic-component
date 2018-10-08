import {
  KeyValueChangeRecord,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';

const { Reflect } = window as any;

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

export function getCtorType(ctor: any): any[] {
  return Reflect.getMetadata('design:paramtypes', ctor);
}
