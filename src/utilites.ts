import { ValidationEvent } from './validation-event';

export const noop = () => {};

export const combineErrors = (groutErrors: ValidationEvent[][]) =>
  groutErrors.reduce((acumulator, value) => [...acumulator, ...value], [] as ValidationEvent[]).filter(err => !!err);
