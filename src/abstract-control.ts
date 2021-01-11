import { action, computed, IReactionDisposer, observable, reaction, runInAction, when } from 'mobx';
import { ControlTypes } from './сontrol-types';
import { ValidationEvent } from './validation-event';
import { ValidationEventTypes } from './validation-event-types';
import { combineErrors, noop } from './utilites';
import { IDictionary } from './idictionary';
import { Delegate } from './delegate';

export type UpdateValidValueHandler<TEntity> = (val: TEntity) => void;
export type ValidatorsFunction<TAbstractControl extends AbstractControl> = (control: TAbstractControl) => Promise<ValidationEvent[]>
export type ControlsCollection = IDictionary<AbstractControl>;

export abstract class AbstractControl {
  /**
   * Type
   * / Тип контрола
   */
  public readonly type: ControlTypes;

  @observable
  protected inProcessing: boolean;
  /**
   * Validation in progress
   * / В процессе анализа
   */
  abstract processing: boolean;

  private isActiveFunc: () => boolean;

  /**
   * Error checking is disabled (control is always valid)
   * / Проверка ошибок отключена (контрол всегда валиден)
   */
  @computed get disabled(): boolean {
    return !this.active;
  }

  /**
   * Error checking enabled
   * / Проверка ошибок включена
   */
  @computed get active(): boolean {
    return this.isActiveFunc();
  }

  /**
   * Valid
   * / Валидные данные
   */
  @computed
  get valid(): boolean {
    return !this.invalid;
  }

  /**
   * Invalid
   * / Невалидные данные
   */
  abstract invalid: boolean;

  /**
   * The value has not changed
   * / Значение не изменялось
   */
  @computed
  get pristine(): boolean {
    return !this.dirty;
  }

  /**
   * Value changed
   * / Значение изменялось
   */
  abstract dirty: boolean;

  /**
   * The field was out of focus
   * / Поле не было в фокусе
   */
  @computed
  get untouched(): boolean {
    return !this.touched;
  }

  /**
   * The field was in focus
   * / Поле было в фокусе
   */
  abstract touched: boolean;

  /**
   * The field is now in focus
   * / Поле сейчас в фокусе
   */
  abstract focused: boolean;

  @observable
  private _serverErrors: string[] = [];

  /**
   * Additional (server) errors
   * / Дополнительтные (серверные) ошибки
   */
  @computed
  public get serverErrors(): string[] {
    return this._serverErrors;
  }

  /**
   * Additional (server) errors
   * / Дополнительтные (серверные) ошибки
   */
  public set serverErrors(value: string[]) {
    this._serverErrors = value || [];
  }

  /**
   * Errors list
   * / Список ошибок
   */
  @observable.ref
  public errors: ValidationEvent[] = [];

  /**
   *  The field contains errors
   * / Присутствуют ошибки
   */
  public hasErrors() {
    return (!!this.errors && this.errors.length > 0) || (!!this._serverErrors && this._serverErrors.length > 0);
  }

  /**
   * Warnings messages list
   * / Список сообщений с типом "Внимание"
   */
  @observable.ref
  public warnings: ValidationEvent[] = [];

  /**
   *  The field contains warnings messages
   * / Присутствуют сообщения с типом "Внимание"
   */
  public hasWarnings() {
    return !!this.warnings && this.warnings.length > 0;
  }

  /**
   * Informations messages list
   * / Сообщения с типом "Информационные сообщения"
   */
  @observable.ref
  public informationMessages: ValidationEvent[] = [];

  /**
   *  The field contains informations messages
   * / Присутствуют сообщения с типом "Информационные сообщения"
   */
  public hasInformationMessages() {
    return !!this.informationMessages && this.informationMessages.length > 0;
  }

  /**
   * Successes messages list
   * / Сообщения с типом "успешная валидация"
   */
  @observable.ref
  public successes: ValidationEvent[] = [];

  /**
   *  The field contains successes
   * / Присутствуют сообщения с типом "успешная валидация"
   */
  public hasSuccesses() {
    return !!this.successes && this.successes.length > 0;
  }

  /**
   * Max message level
   * / Максимальный уровень сообщения
   */
  @computed get maxEventLevel(): ValidationEventTypes {
    if (this.hasErrors()) return ValidationEventTypes.Error;
    if (this.hasWarnings()) return ValidationEventTypes.Warning;
    if (this.hasInformationMessages()) return ValidationEventTypes.Info;
    return ValidationEventTypes.Success;
  }

  /**
   * Set marker "value changed"
   * / Изменяет состояния маркета "данные изменены"
   */
  abstract setDirty(dirty: boolean): this;

  /**
   * Set marker "field was out of focus"
   * / Изменяет состояния маркета "значение было в фокусе"
   */
  abstract setTouched(touched: boolean): this;

  /**
   * Field for transferring additional information
   * / Поле для передачи дополнительной информации (в логике не участвует) 
   */
  @observable
  public additionalData: any;

  public element: HTMLElement | null = null;

  /**
   * Callback function of on change
   * / Сообщает факт изменения данных
   */
  public onChange: Delegate<AbstractControl> = new Delegate<AbstractControl>();

  constructor(
    /**
     * Function enable validation by condition (always enabled by default)
     * / Функция включение валидаций по условию (по умолчанию включено всегда)
     */
    activate: (() => boolean) | null = null,
    additionalData: any,
    type: ControlTypes
  ) {
    this.inProcessing = false;
    this.isActiveFunc = activate === null ? () => true : activate;
    this.additionalData = additionalData;
    this.type = type;
  }

  /**
   * Dispose (call in unmount react control)
   * / Вызвать при удалении контрола
   */
  dispose(): void {
    this.onChange.dispose();
    for (const reactionOnValidator of this.reactionOnValidatorDisposers) {
      reactionOnValidator();
    }
  }

  /**
   * Get error by key
   * / Получить ошибку по ключу
   */
  public error = (key: string): ValidationEvent | undefined => {
    return this.errors.find(err => err.key === key);
  };

  private newRequestValidation: number = 0;
  private lastValidators: ValidatorsFunction<any>[] = [];
  private lastValidationFunction = noop;
  protected reactionOnValidatorDisposers: IReactionDisposer[] = [];
  @action
  protected onValidation = async <TAbstractControl extends AbstractControl>(
    validators: ValidatorsFunction<TAbstractControl>[],
    onValidationFunction: () => void,
    afterCheck: () => void,
  ): Promise<void> => {
    const haveRequestValidation: boolean = this.newRequestValidation !== 0;
    this.newRequestValidation++;
    this.lastValidators = validators;
    this.lastValidationFunction = onValidationFunction;
    if (haveRequestValidation) {
      return;
    }
    let groupErrors: ValidationEvent[][];
    let oldRequestValidation = 0;
    do {
      oldRequestValidation = this.newRequestValidation;
      this.reactionOnValidatorDisposers.forEach(r => r());
      this.reactionOnValidatorDisposers = [];
      if (this.active) {
        const errorsPromises = this.lastValidators.map(validator => {
          let isFirstReaction = true;
          return new Promise<ValidationEvent[]>(resolve =>
            this.reactionOnValidatorDisposers.push(
              reaction(() => {
                let result;
                if (isFirstReaction) {
                  result = validator(this).then(resolve);
                }
                isFirstReaction = false;
                return result;
              }, this.lastValidationFunction),
            ),
          );
        });
        groupErrors = await Promise.all(errorsPromises);
      } else {
        groupErrors = [];
      }
    } while (oldRequestValidation !== this.newRequestValidation);
    this.newRequestValidation = 0;
    const events = groupErrors && groupErrors.length > 0 ? combineErrors(groupErrors) : [];
    runInAction(() => {
      this.errors = events.filter(e => e.type === ValidationEventTypes.Error);
      this.warnings = events.filter(e => e.type === ValidationEventTypes.Warning);
      this.informationMessages = events.filter(e => e.type === ValidationEventTypes.Info);
      this.successes = events.filter(e => e.type === ValidationEventTypes.Success);

      afterCheck();
    });
  };

  /**
   * Waiting for end of validation
   * Ожидание окончания проверки
   */
  public wait(): Promise<void> {
    return when(() => !this.processing);
  }

  public abstract executeAsyncValidation(validator: (control: this) => Promise<ValidationEvent[]>): Promise<ValidationEvent[]>;

  public abstract runInAction(action: () => void): void;

  protected baseExecuteAsyncValidation = (
    validator: (control: this) => Promise<ValidationEvent[]>,
    onValidationFunction: () => void,
  ): Promise<ValidationEvent[]> => {
    let isFirstReaction = true;
    return new Promise<ValidationEvent[]>(resolve =>
      this.reactionOnValidatorDisposers.push(
        reaction(() => {
          let result;
          if (isFirstReaction) {
            result = validator(this).then(resolve);
          }
          isFirstReaction = false;
          return result;
        }, onValidationFunction),
      ),
    );
  };
}
