/**
 * @public
 */
export interface InputsType {
  [k: string]: unknown;
}

/**
 * @public
 */
export interface OutputsType {
  [k: string]: OutputExpression | undefined;
}

/**
 * @public
 */
export interface OutputWithArgs {
  handler: AnyFunction;
  args?: unknown[];
}

/**
 * @public
 */
export type OutputExpression = EventHandler | OutputWithArgs;

/**
 * @public
 */
export type EventHandler<T = unknown> = (event: T) => unknown;

/**
 * @public
 */
export type AnyFunction = (...args: unknown[]) => unknown;
