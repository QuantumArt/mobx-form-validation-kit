import { action, computed, makeObservable } from 'mobx';
import { AbstractControl } from './abstract-control';
import { FormControl } from './form-control';
import { ControlTypes } from './сontrol-types';

export abstract class FormAbstractGroup extends AbstractControl {
  get processing(): boolean {
    return this.inProcessing || this.abbreviatedOR(control => control.processing);
  }

  get invalid(): boolean {
    return this.active && (this.errors.length > 0 || this.serverErrors.length > 0 || this.abbreviatedOR(control => control.invalid));
  }

  get dirty(): boolean {
    return this.abbreviatedOR(control => control.dirty);
  }

  get touched(): boolean {
    return this.abbreviatedOR(control => control.touched);
  }

  get focused(): boolean {
    return this.abbreviatedOR(control => control.focused);
  }

  constructor(
    /**
    * Function enable validation by condition (always enabled by default)
    * / Функция включение валидаций по условию (по умолчанию включено всегда)
    */
    activate: (() => boolean) | null = null,
    additionalData: any,
    type: ControlTypes
  ) {
    super(activate, additionalData, type);
    makeObservable(this, {
      processing: computed,
      invalid: computed,
      dirty: computed,
      touched: computed,
      focused: computed,
      
      setDirty: action,
      setTouched: action,

      allControls: action
    });
  }

  /**
  * Set marker "Value has changed" 
  * / Установить маркер "Значение изменилось"
  */
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
  public allControls(): FormControl<any>[] {
    let controls: FormControl<any>[] = [];
    for (const control of this.getControls()) {
      if (control.type === ControlTypes.Control) {
        controls.push(control as FormControl<any>);
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
