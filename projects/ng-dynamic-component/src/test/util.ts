import { DebugElement, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export function getDirective<T>(dirType: Type<T>) {
  return getByPredicate<T>(By.directive(dirType));
}

export function getByPredicate<T>(predicate: any) {
  return (fixture: ComponentFixture<any>) => getCompFrom<T>(predicate, fixture);
}

export function getCompFrom<T>(predicate: any, fixture: ComponentFixture<any>) {
  const componentElem = fixture.debugElement.query(predicate);
  const component = componentElem.componentInstance as T;
  return { componentElem, component };
}
