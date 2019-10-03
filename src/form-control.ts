import { action, computed, IReactionDisposer, observable, reaction } from 'mobx';
import { ValidationEvent } from './validation-event';
import { ValidatorFunctionFormControlHandler, UpdateValidValueHandler } from './events';
import { FormAbstractControl } from './form-abstract-control';
import { ControlTypes } from './сontrol-types';

export class FormControl<TEntity = string, TAdditionalData = any> extends FormAbstractControl {
  private readonly reactionOnInternalValueDisposer: IReactionDisposer;
  private readonly reactionOnIsActiveDisposer: IReactionDisposer;
  private readonly reactionOnIsDirtyDisposer: IReactionDisposer;
  private readonly reactionOnIsFocusedDisposer: IReactionDisposer;
  private validators: ValidatorFunctionFormControlHandler<TEntity>[] = [];

  public readonly type: ControlTypes = ControlTypes.Control;

  @observable
  private internalValue: TEntity;

  @computed get processing(): boolean {
    return this.inProcessing;
  }

  @computed
  public get value(): TEntity {
    return this.internalValue;
  }

  public set value(value: TEntity) {
    this.internalValue = value;
  }

  @computed get invalid(): boolean {
    return this.active && (this.errors.length > 0 || this.serverErrors.length > 0);
  }

  @computed get valid(): boolean {
    return this.disabled || (this.errors.length === 0 && this.serverErrors.length === 0);
  }

  @observable
  private isDirty: boolean = false;

  @computed get pristine(): boolean {
    return !this.isDirty;
  }

  @computed get dirty(): boolean {
    return this.isDirty;
  }

  @observable
  private isTouched: boolean = false;
  @computed get untouched(): boolean {
    return !this.isTouched;
  }

  @computed get touched(): boolean {
    return this.isTouched;
  }

  @observable
  private isFocused: boolean = false;

  @computed get focused(): boolean {
    return this.isFocused;
  }

  @observable
  public additionalData: TAdditionalData;

  static for<M extends Object, K extends keyof M, TAdditionalData = any>(
    /**
     * Model object containing the editable field
     * Объект модели, содержащий редактируемое поле
     */
    model: M,
    /**
     * Field name of the model to edit
     * Имя редактируемого поля модели
     */
    fieldName: K,
    /**
     * Validations
     * Валидациии
     */
    validators?: ValidatorFunctionFormControlHandler<M[K]>[],
    /**
     * Function enable validation by condition (always enabled by default)
     * Функция включение валидаций по условию (по умолчанию включено всегда)
     */
    activate?: () => boolean,
    /**
     * Additional information
     * Блок с дополнительной информацией
     */
    additionalData?: TAdditionalData,
  ): FormControl<M[K]> {
    return new FormControl<M[K]>(model[fieldName], validators, (value: M[K]) => (model[fieldName] = value), activate, additionalData);
  }

  constructor(
    /**
     * Initializing valueI
     * / Инициализирующие значение
     */
    value: TEntity,
    /**
     * Validators
     * / Валидаторы
     */
    validators: ValidatorFunctionFormControlHandler<TEntity>[] = [],
    /**
     * Callback get last valid value
     * / Передает последние валидное значение
     */
    private callbackValidValue: UpdateValidValueHandler<TEntity> | null = null,
    /**
     * Function enable validation by condition (always enabled by default)
     * / Функция включение валидаций по условию (по умолчанию включено всегда)
     */
    activate: (() => boolean) | null = null,
    /**
     * Additional information
     * / Блок с дополнительной информацией
     */
    additionalData: TAdditionalData | null = null,
  ) {
    super(activate);
    this.internalValue = value;
    this.validators = validators;
    this.additionalData = additionalData;

    this.reactionOnIsActiveDisposer = reaction(
      () => this.isActive,
      () => {
        this.checkInternalValue();
        this.onChange.call();
      },
    );

    this.reactionOnIsDirtyDisposer = reaction(
      () => this.isDirty,
      (isDirty: boolean) => {
        if (isDirty) {
          this.serverErrors = [];
        }
      },
    );

    this.reactionOnIsFocusedDisposer = reaction(
      () => this.isFocused,
      (isFocused: boolean) => {
        if (!isFocused) {
          this.serverErrors = [];
        }
      },
    );

    this.reactionOnInternalValueDisposer = reaction(
      () => this.internalValue,
      () => {
        this.isDirty = true;
        this.serverErrors = [];
        this.checkInternalValue();
        this.onChange.call();
      },
    );

    this.checkInternalValue();
  }

  public executeAsyncValidation = (validator: (control: FormControl<TEntity>) => Promise<ValidationEvent[]>): Promise<ValidationEvent[]> =>
    this.baseExecuteAsyncValidation(validator, () => {
      this.serverErrors = [];
      this.checkInternalValue();
    });

  public runInAction = <TData = void>(action: () => Promise<TData>): Promise<TData> => {
    return new Promise<TData>(resolve =>
      this.reactionOnValidatorDisposers.push(
        reaction(
          () => action().then(resolve),
          () => {
            this.serverErrors = [];
            this.checkInternalValue();
          },
        ),
      ),
    );
  };

  @action
  public error = (key: string): ValidationEvent | undefined => {
    return this.errors.find(err => err.key === key);
  };

  @action
  public setDirty = (dirty: boolean) => {
    this.isDirty = dirty;
  };

  @action
  public setTouched = (touched: boolean) => {
    this.isTouched = touched;
  };

  @action
  public setFocused = (focused: boolean) => {
    this.isFocused = focused;
  };

  public dispose = (): void => {
    this.baseDispose();
    this.reactionOnInternalValueDisposer();
    this.reactionOnIsActiveDisposer();
    this.reactionOnIsDirtyDisposer();
    this.reactionOnIsFocusedDisposer();
  };

  @action
  private checkInternalValue = () => {
    this.inProcessing = true;
    this.onValidation(this.validators, this.checkInternalValue, () => {
      if (this.callbackValidValue && this.errors.length === 0) {
        this.callbackValidValue(this.internalValue);
      }
      this.inProcessing = false;
    });
  };
}
