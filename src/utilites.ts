import { ValidationEvent } from './validation-event';

export const noop = () => {};

export const identity = <T = any>(arg: T) => arg;

export const combineErrors = (groutErrors: ValidationEvent[][]) =>
  groutErrors.reduce((acumulator, value) => [...acumulator, ...value]).filter(err => !!err);
