import { IDictionary } from './idictionary';
import { ValidationEvent } from './validation-event';
import { AbstractControl } from './abstract-control';
import { FormControl } from './form-control';
import { FormGroup } from './form-group';

export type AbstractControls = IDictionary<AbstractControl | AbstractControl[]>;
export type UpdateValidValueHandler<TEntity> = (val: TEntity) => void;
export type ValidatorFunctionFormControlHandler<TEntity> = (control: FormControl<TEntity>) => Promise<ValidationEvent[]>;
export type ValidatorFunctionFormGroupHandler<TAbstractControls extends AbstractControls> = (
  control: FormGroup<TAbstractControls>,
) => Promise<ValidationEvent[]>;
export type ValidatorFunctionFormArrayHandler<TAbstractControls extends AbstractControl[]> = (control: TAbstractControls) => Promise<ValidationEvent[]>;
