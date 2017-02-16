import { SimpleChange } from '@angular/core';

export const UNINITIALIZED = Object.freeze({ __uninitialized: true });

export class CustomSimpleChange extends SimpleChange {
  isFirstChange() {
    return this.previousValue === UNINITIALIZED || super.isFirstChange();
  }
}
