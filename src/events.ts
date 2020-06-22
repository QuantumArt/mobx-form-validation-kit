import { ValidationEvent } from './validation-event';
import { AbstractControl } from './abstract-control';
import { IDictionary } from './idictionary';

export declare type GroupControls = IDictionary<AbstractControl | AbstractControl[]>;
export type UpdateValidValueHandler<TEntity> = (val: TEntity) => void;
export type ValidatorFunctionFormControlHandler<TAbstractControl extends AbstractControl> = (control: TAbstractControl) => Promise<ValidationEvent[]>;