import { action, computed, IReactionDisposer, observable, reaction } from 'mobx';
import { ValidationEvent } from './validation-event';
import { ValidatorFunctionFormControlHandler, UpdateValidValueHandler } from './events';
import { FormAbstractControl } from './form-abstract-control';
import { ControlTypes } from './сontrol-types';
import { noop } from './utilites';

interface Options<TEntity, TAdditionalData> {
  /**
   * Function enable validation by condition (always enabled by default)
   * Функция включение валидаций по условию (по умолчанию включено всегда)
   */
  activate?: (() => boolean) | null;
  /**
   * Additional information
   * Блок с дополнительной информацией
   */
  additionalData?: TAdditionalData | null;
  /**
   * Validations
   * Валидациии
   */
  validators?: ValidatorFunctionFormControlHandler<TEntity>[];
  /**
   * Callback get last valid value
   * Передает последние валидное значение
   */
  setValidValue?: UpdateValidValueHandler<TEntity> | null;
  /**
   * Invoke `setValidValue` when `FormControl` is created.
   * Вызвать `setValidValue` при создании `FormControl`.
   * @default false
   * @example
   * const model = observable({ value: 123 });
   * new FormControl(
   *   () => model.value,
   *   [],
   *   value => { console.log({ value }); },
   *   { callSetterOnInitialize: true }
   * ); // then we see { value: 123 } in console immediately
   */
  callSetterOnInitialize?: boolean;
  /**
   * Invoke `setValidValue` when value-getter that passed as first argument changes its underlying value.
   * Вызывать `setValidValue` при каждом изменении результата функции-геттера из первого аргумента.
   * @default false
   * @example
   * const model = observable({ value: 123 });
   * new FormControl(
   *   () => model.value,
   *   [],
   *   value => { console.log({ value }); },
   *   { callSetterOnReinitialize: true }
   * );
   * model.value = 456; // then we see { value: 456 } in console
   */
  callSetterOnReinitialize?: boolean;
  /**
   * Apply model field changes to FormControl value changes.
   * Применять изменения поля модели к полю формы.
   * @default true
   */
  reflectModelChanges?: boolean;
}

function isOptions<TEntity, TAdditionalData>(arg: any): arg is Options<TEntity, TAdditionalData> {
  return typeof arg === 'object' && arg !== null && arg.constructor === Object;
}

function getOptions<TEntity, TAdditionalData>(
  validators?: ValidatorFunctionFormControlHandler<TEntity>[] | Options<TEntity, TAdditionalData>,
  setValidValue?: UpdateValidValueHandler<TEntity> | Options<TEntity, TAdditionalData> | null,
  activate?: (() => boolean) | Options<TEntity, TAdditionalData> | null,
  additionalData?: TAdditionalData | null,
): Options<TEntity, TAdditionalData> {
  const options: Options<TEntity, TAdditionalData> = {};
  if (validators) {
    if (isOptions<TEntity, TAdditionalData>(validators)) {
      Object.assign(options, validators);
    } else {
      options.validators = validators;
    }
  }
  if (setValidValue) {
    if (isOptions<TEntity, TAdditionalData>(setValidValue)) {
      Object.assign(options, setValidValue);
    } else {
      options.setValidValue = setValidValue;
    }
  }
  if (activate) {
    if (isOptions<TEntity, TAdditionalData>(activate)) {
      Object.assign(options, activate);
    } else {
      options.activate = activate;
    }
  }
  if (additionalData !== null) {
    options.additionalData = additionalData;
  }
  return options;
}

export class FormControl<TEntity = string, TAdditionalData = any> extends FormAbstractControl {
  private reactionOnValueGetterDisposer: IReactionDisposer | undefined;
  private reactionOnInternalValueDisposer: IReactionDisposer | undefined;
  private readonly reactionOnIsActiveDisposer: IReactionDisposer;
  private readonly reactionOnIsDirtyDisposer: IReactionDisposer;
  private readonly reactionOnIsFocusedDisposer: IReactionDisposer;
  private readonly validators: ValidatorFunctionFormControlHandler<TEntity>[];
  private readonly setValidValue: UpdateValidValueHandler<TEntity>;
  private readonly callSetterOnInitialize: boolean;
  private readonly callSetterOnReinitialize: boolean;

  public readonly type: ControlTypes = ControlTypes.Control;
  private isInitialized: boolean = false;

  @observable
  // @ts-ignore: internalValue is always initialized in this.setInitialValue() call
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
  public additionalData: TAdditionalData | null;

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
    validators?: ValidatorFunctionFormControlHandler<M[K]>[] | Options<M[K], TAdditionalData>,
    /**
     * Options
     * Опции
     */
    modelOptions?: Options<M[K], TAdditionalData>,
  ): FormControl<M[K], TAdditionalData> {
    const { reflectModelChanges = true } = getOptions(validators, (value: M[K]) => (model[fieldName] = value), modelOptions);
    return new FormControl<M[K], TAdditionalData>(reflectModelChanges ? () => model[fieldName] : model[fieldName], modelOptions);
  }

  constructor(
    /**
     * Initializing valueI
     * / Инициализирующие значение или его getter
     */
    valueOrGetter: TEntity | (() => TEntity),
    /**
     * Validators
     * / Валидаторы
     */
    validators: ValidatorFunctionFormControlHandler<TEntity>[] | Options<TEntity, TAdditionalData> = [],
    /**
     * Callback get last valid value
     * / Передает последние валидное значение
     */
    setValidValue: UpdateValidValueHandler<TEntity> | Options<TEntity, TAdditionalData> | null = null,
    /**
     * Function enable validation by condition (always enabled by default)
     * / Функция включение валидаций по условию (по умолчанию включено всегда)
     */
    activate: (() => boolean) | Options<TEntity, TAdditionalData> | null = null,
    /**
     * Additional information
     * / Блок с дополнительной информацией
     */
    additionalData: TAdditionalData | null = null,
  ) {
    super(getOptions(validators, setValidValue, activate, additionalData).activate);
    const options = getOptions(validators, setValidValue, activate, additionalData);
    this.validators = options.validators || [];
    this.setValidValue = options.setValidValue || noop;
    this.additionalData = options.additionalData || null;
    this.callSetterOnInitialize = this.getCallSetterOnInitialize(options);
    this.callSetterOnReinitialize = options.callSetterOnReinitialize || false;

    this.reactionOnIsActiveDisposer = reaction(
      () => this.isActive,
      () => {
        this.checkInternalValue(this.isInitialized || this.callSetterOnInitialize);
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

    this.setInitialValue(valueOrGetter);

    // schedule isInitialized flag change on next tick in Microtask queue
    // to run in after all synchronous MobX reactions
    Promise.resolve().then(() => (this.isInitialized = true));
  }

  protected getCallSetterOnInitialize({ callSetterOnInitialize }: Options<TEntity, TAdditionalData>) {
    return callSetterOnInitialize || false;
  }

  public setInitialValue = (valueOrGetter: TEntity | (() => TEntity)) => {
    const valueGetter = valueOrGetter instanceof Function ? valueOrGetter : () => valueOrGetter;

    this.reactionOnValueGetterDisposer && this.reactionOnValueGetterDisposer();

    this.reactionOnValueGetterDisposer = reaction(
      valueGetter,
      initialValue => {
        this.reactionOnInternalValueDisposer && this.reactionOnInternalValueDisposer();

        this.internalValue = initialValue;

        this.reactionOnInternalValueDisposer = reaction(
          () => this.internalValue,
          () => {
            this.isDirty = true;
            this.serverErrors = [];
            this.checkInternalValue();
            this.onChange.call();
          },
        );

        if (this.isInitialized) {
          this.checkInternalValue(this.callSetterOnReinitialize);
        } else {
          this.checkInternalValue(this.callSetterOnInitialize);
        }
      },
      { fireImmediately: true },
    );

    return this;
  };

  public executeAsyncValidation = (validator: (control: this) => Promise<ValidationEvent[]>): Promise<ValidationEvent[]> =>
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
  public setValue = (value: TEntity) => {
    this.internalValue = value;
    return this;
  };

  @action
  public setDirty = (dirty: boolean) => {
    this.isDirty = dirty;
    return this;
  };

  @action
  public setTouched = (touched: boolean) => {
    this.isTouched = touched;
    return this;
  };

  @action
  public setFocused = (focused: boolean) => {
    this.isFocused = focused;
    return this;
  };

  public dispose = (): void => {
    this.baseDispose();
    this.reactionOnValueGetterDisposer && this.reactionOnValueGetterDisposer();
    this.reactionOnInternalValueDisposer && this.reactionOnInternalValueDisposer();
    this.reactionOnIsActiveDisposer();
    this.reactionOnIsDirtyDisposer();
    this.reactionOnIsFocusedDisposer();
  };

  @action
  private checkInternalValue = (shouldCallSetter: boolean = true) => {
    this.inProcessing = true;
    this.onValidation(this.validators, this.checkInternalValue, () => {
      if (shouldCallSetter && this.setValidValue && this.errors.length === 0) {
        this.setValidValue(this.internalValue);
      }
      this.inProcessing = false;
    });
  };
}

export class FormControlLegacy<TEntity = string, TAdditionalData = any> extends FormControl<TEntity, TAdditionalData> {
  protected getCallSetterOnInitialize({ callSetterOnInitialize }: Options<TEntity, TAdditionalData>) {
    return callSetterOnInitialize === null || callSetterOnInitialize === undefined ? true : callSetterOnInitialize;
  }
}
