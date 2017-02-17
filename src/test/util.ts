import { Predicate } from '@angular/compiler/src/facade/collection';
import { DebugElement, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export function getByPredicate<T>(predicate: Predicate<DebugElement>) {
  return (fixture: ComponentFixture<any>) => getCompFrom<T>(predicate, fixture);
}

export function getCompFrom<T>(predicate: Predicate<DebugElement>, fixture: ComponentFixture<any>) {
  const componentElem = fixture.debugElement.query(predicate);
  const component = componentElem.componentInstance as T;
  return { componentElem, component };
}
