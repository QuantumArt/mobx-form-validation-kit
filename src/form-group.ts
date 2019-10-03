import { action, IReactionDisposer, reaction, runInAction } from 'mobx';
import { AbstractControls, ValidatorFunctionFormGroupHandler } from 'events';
import { AbstractControl } from 'abstract-control';
import { ValidationEvent } from 'validation-event';
import { FormAbstractGroup } from 'form-abstract-group';
import { FormAbstractControl } from 'form-abstract-control';
import { ControlTypes } from 'сontrol-types';

export class FormGroup<TControls extends AbstractControls = AbstractControls> extends FormAbstractGroup {
  public readonly type: ControlTypes = ControlTypes.Group;
  private readonly reactionOnIsActiveDisposer: IReactionDisposer;

  private readonly validators: ValidatorFunctionFormGroupHandler<TControls>[] = [];

  public controls: TControls;

  constructor(
    /** controls */
    controls: TControls,
    /**
     * Validators
     * / Валидаторы
     */
    validators: ValidatorFunctionFormGroupHandler<TControls>[] = [],
    /**
     * Function enable validation by condition (always enabled by default)
     * / Функция включение валидаций по условию (по умолчанию включено всегда)
     */
    activate: (() => boolean) | null = null,
  ) {
    super(activate);
    this.controls = controls;
    this.validators = validators;

    this.reactionOnIsActiveDisposer = reaction(
      () => this.isActive,
      () => {
        this.checkGroupValidations();
        this.onChange.call();
      },
    );

    for (const control of this.getControls()) {
      control.onChange.add(() => {
        this.serverErrors = [];
        this.checkGroupValidations();
        this.onChange.call();
      });
    }

    this.checkGroupValidations();
  }

  public dispose = (): void => {
    this.baseDispose();
    this.reactionOnIsActiveDisposer();
    for (const control of this.getControls()) {
      control.dispose();
    }
  };

  @action
  public allControls(): FormAbstractControl[] {
    let controls: FormAbstractControl[] = [];
    for (const control of this.getControls()) {
      if (control.type === ControlTypes.Control) {
        controls.push(control as FormAbstractControl);
      } else if (control.type === ControlTypes.Group || control.type === ControlTypes.Array) {
        controls = controls.concat((control as FormAbstractGroup).allControls());
      }
    }
    return controls;
  }

  @action
  public error = (key: string): ValidationEvent | undefined => {
    return this.errors.find(err => err.key === key);
  };

  @action
  public setDirty = (dirty: boolean) => {
    for (const control of this.getControls()) {
      control.setDirty(dirty);
    }
  };

  @action
  public setTouched = (touched: boolean) => {
    for (const control of this.getControls()) {
      control.setTouched(touched);
    }
  };

  @action
  private checkGroupValidations = () => {
    this.inProcessing = true;
    this.onValidation(this.validators, this.checkGroupValidations, () =>
      runInAction(() => {
        this.inProcessing = false;
      }),
    );
  };

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

  private *getControls(): IterableIterator<AbstractControl> {
    for (const keyName in this.controls) {
      const control = this.controls[keyName];
      if (control instanceof Array) {
        for (const controlItem of control) {
          yield controlItem;
        }
      } else {
        yield control as AbstractControl;
      }
    }
  }

  public executeAsyncValidation = (validator: (control: FormGroup<TControls>) => Promise<ValidationEvent[]>): Promise<ValidationEvent[]> =>
    this.baseExecuteAsyncValidation(validator, () => {
      this.serverErrors = [];
      this.checkGroupValidations();
    });
}
