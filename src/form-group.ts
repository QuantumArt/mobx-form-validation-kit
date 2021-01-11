import { action, IReactionDisposer, reaction } from 'mobx';
import { AbstractControl, ControlsCollection, ValidatorsFunction } from './abstract-control';
import { ValidationEvent } from './validation-event';
import { FormAbstractGroup } from './form-abstract-group';
import { ControlTypes } from './сontrol-types';

export interface IOptionsFormGroup<TControls extends ControlsCollection> {
  /**
   * Validations
   * Валидациии
   */
  validators?: ValidatorsFunction<FormGroup<TControls>>[],
  /**
   * Additional information
   * Блок с дополнительной информацией
   */
  additionalData?: any;
  /**
   * Function enable validation by condition (always enabled by default)
   * / Функция включение валидаций по условию (по умолчанию включено всегда)
   */
  activate?: (() => boolean) | null;
}

export class FormGroup<TControls extends ControlsCollection = ControlsCollection> extends FormAbstractGroup {
  private readonly reactionOnIsActiveDisposer: IReactionDisposer;

  private readonly validators: ValidatorsFunction<FormGroup<TControls>>[] = [];

  public controls: TControls;

  constructor(
    /**
     * Сontrols
     * / Контролы
     */
    controls: TControls,
    /**
     * Options
     * / Опции
     */
    options: IOptionsFormGroup<TControls> = {},
  ) {
    super(options.activate ?? null, options.additionalData, ControlTypes.Group);
    this.controls = controls;
    this.validators = options.validators ?? [];

    this.reactionOnIsActiveDisposer = reaction(
      () => this.active,
      () => {
        this.serverErrors = [];
        this.checkGroupValidations();
        this.onChange.call(this);
      },
    );

    for (const control of this.getControls()) {
      control.onChange.addListen(() => {
        this.serverErrors = [];
        this.checkGroupValidations();
        this.onChange.call(this);
      });
    }

    this.checkGroupValidations();
  }

  public dispose = (): void => {
    super.dispose();
    this.reactionOnIsActiveDisposer();
    for (const control of this.getControls()) {
      control.dispose();
    }
  };

  public executeAsyncValidation = (validator: (control: this) => Promise<ValidationEvent[]>): Promise<ValidationEvent[]> =>
    this.baseExecuteAsyncValidation(validator, () => this.checkGroupValidations());

  protected *getControls(): IterableIterator<AbstractControl> {
    for (const keyName in this.controls) {
      yield this.controls[keyName];
    }
  }

  @action
  private checkGroupValidations = () => {
    this.inProcessing = true;
    this.serverErrors = [];
    this.onValidation(this.validators, this.checkGroupValidations, () => this.inProcessing = false)
  };

  public runInAction(action: () => void): void {
    this.reactionOnValidatorDisposers.push(
      reaction(
        () => action(),
        () => this.checkGroupValidations()
      )
    );
  };
}
