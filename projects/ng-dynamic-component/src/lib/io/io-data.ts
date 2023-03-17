import { EventEmitter } from '@angular/core';

export interface IOData {
  [prop: string]: unknown;
}

type InferEventEmitter<T> = T extends EventEmitter<infer E> ? E : unknown;

type SkipPropsByType<T, TSkip> = {
  [K in keyof T]: T[K] extends TSkip ? never : K;
}[keyof T];

type PickPropsWithOutputs<
  O extends string | number | symbol,
  I extends string | number | symbol,
> = O extends `${infer K}Change` ? (K extends I ? K : never) : never;

export type Inputs<K extends keyof T, T> = Pick<T, K>;

export type InputProps<K extends keyof T, T> = {
  [P in K as `[${P & string}]`]: T[P];
};

export type Inputs2Way<K> = {
  [P in K as `([${P & string}])`]: string;
};

export type InputsAttrs = {
  [P in [] as `[attr.${string}]`]?: string | null;
};

export type InputsClasses = {
  [P in [] as `[class.${string}]`]?: string | boolean | null;
};

export type InputsStyles = {
  [P in [] as `[style.${string}]`]?: unknown;
};

export type Outputs<K extends keyof T, T> = {
  [P in K as `(${P & string})`]: (event: InferEventEmitter<T[P]>) => void;
};

export type IO<
  T,
  I extends keyof T = SkipPropsByType<T, EventEmitter<any>>,
  O extends keyof T = Exclude<keyof T, I>,
  I2W extends keyof T = PickPropsWithOutputs<O, I>,
> = Partial<
  Inputs<I, T> &
    InputProps<I, T> &
    Inputs2Way<I2W> &
    Outputs<O, T> &
    InputsAttrs &
    InputsClasses &
    InputsStyles &
    Record<string, unknown>
>;
