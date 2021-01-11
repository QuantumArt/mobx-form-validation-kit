import { action, computed } from 'mobx';
import { AbstractControl } from './abstract-control';
import { ControlTypes } from './сontrol-types';

export abstract class FormAbstractGroup extends AbstractControl {
  @computed get processing(): boolean {
    return this.inProcessing || this.abbreviatedOR(control => control.processing);
  }

  @computed get invalid(): boolean {
    return this.active && (this.errors.length > 0 || this.serverErrors.length > 0 || this.abbreviatedOR(control => control.invalid));
  }

  @computed get dirty(): boolean {
    return this.abbreviatedOR(control => control.dirty);
  }

  @computed get touched(): boolean {
    return this.abbreviatedOR(control => control.touched);
  }

  @computed get focused(): boolean {
    return this.abbreviatedOR(control => control.focused);
  }

  /**
  * Set marker "Value has changed" 
  * / Установить маркер "Значение изменилось"
  */
  @action
  public setDirty = (dirty: boolean) => {
    for (const control of this.getControls()) {
      control.setDirty(dirty);
    }
    return this;
  };

  /**
   * Set marker "field was in focus" 
   * / Установить маркер "Поле было в фокусе"
   */
  @action
  public setTouched = (touched: boolean) => {
    for (const control of this.getControls()) {
      control.setTouched(touched);
    }
    return this;
  };

  /**
   * Returns a complete list of FormControls without attachments (terminal elements)
   * Возвращает полный список FormControl-ов без вложений (терминальных элементов)
   */
  @action
  public allControls(): AbstractControl[] {
    let controls: AbstractControl[] = [];
    for (const control of this.getControls()) {
      if (control.type === ControlTypes.Control) {
        controls.push(control as AbstractControl);
      } else if (control.type === ControlTypes.Group || control.type === ControlTypes.Array) {
        controls = controls.concat((control as FormAbstractGroup).allControls());
      }
    }
    return controls;
  }

  protected abstract getControls(): IterableIterator<AbstractControl>;

  protected abbreviatedAND = (getData: (control: AbstractControl) => boolean): boolean => {
    for (const control of this.getControls()) {
      if (!getData(control)) {
        return false;
      }
    }
    return true;
  };

  protected abbreviatedOR = (getData: (control: AbstractControl) => boolean): boolean => {
    for (const control of this.getControls()) {
      if (getData(control)) {
        return true;
      }
    }
    return false;
  };
}
