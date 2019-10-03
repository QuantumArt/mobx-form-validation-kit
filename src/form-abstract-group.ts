import { action, computed, when } from 'mobx';
import { AbstractControl } from './abstract-control';
import { FormAbstractControl } from './form-abstract-control';

export abstract class FormAbstractGroup extends AbstractControl {
  @computed get processing(): boolean {
    return this.inProcessing || this.abbreviatedOR(control => control.processing);
  }

  @computed get invalid(): boolean {
    return this.active && (this.errors.length > 0 || this.serverErrors.length > 0 || this.abbreviatedOR(control => control.invalid));
  }

  @computed get valid(): boolean {
    return this.disabled || (this.errors.length === 0 && this.serverErrors.length === 0 && this.abbreviatedAND(control => control.valid));
  }

  @computed get pristine(): boolean {
    return this.abbreviatedAND(control => control.pristine);
  }

  @computed get dirty(): boolean {
    return this.abbreviatedOR(control => control.dirty);
  }

  @computed get untouched(): boolean {
    return this.abbreviatedAND(control => control.untouched);
  }

  @computed get touched(): boolean {
    return this.abbreviatedOR(control => control.touched);
  }

  @computed get focused(): boolean {
    return this.abbreviatedOR(control => control.focused);
  }

  /**
   * Waiting for end of validation
   * Ожидание окончания проверки
   */
  @action
  public wait(): Promise<void> {
    return when(() => !this.processing);
  }

  public abstract allControls(): FormAbstractControl[];

  protected abstract abbreviatedAND(getData: (control: AbstractControl) => boolean): boolean;
  protected abstract abbreviatedOR(getData: (control: AbstractControl) => boolean): boolean;
}
