import { action, IReactionDisposer, makeObservable, reaction } from 'mobx';
import { AbstractControl, ControlsCollection, ValidatorsFunction } from './abstract-control';
import { ValidationEvent } from './validation-event';
import { FormAbstractGroup } from './form-abstract-group';
import { ControlTypes } from './сontrol-types';
import { FormControl } from './form-control';

type Comparer<TEntity> = (prev: TEntity, current: TEntity) => boolean;
export interface IOptionsFormGroup<TControls extends ControlsCollection> {
  /**
   * Validations
   * Валидациии
   */
  validators?: ValidatorsFunction<FormGroup<TControls>>[];
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

  comparer?: Comparer<any>;
}

type ControlsValueType<TControls extends ControlsCollection = ControlsCollection> = {
  [K in keyof TControls]: TControls[K] extends FormControl<any>
    ? TControls[K]['value']
    : TControls[K] extends FormGroup
    ? ControlsValueType<TControls[K]['controls']>
    : never;
};

export class FormGroup<
  TControls extends ControlsCollection = ControlsCollection,
  TControlsValues = ControlsValueType<TControls>
> extends FormAbstractGroup {
  private readonly reactionOnIsActiveDisposer: IReactionDisposer;

  private readonly validators: ValidatorsFunction<FormGroup<TControls>>[] = [];

  private comparer: Comparer<any>;

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
    makeObservable<FormGroup<TControls, TControlsValues>, 'checkGroupValidations'>(this, {
      checkGroupValidations: action,
    });

    this.comparer = options.comparer || ((prev: any, next: any) => prev === next);

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

  private checkGroupValidations = () => {
    this.inProcessing = true;
    this.serverErrors = [];
    this.onValidation(this.validators, this.checkGroupValidations, () => (this.inProcessing = false));
  };

  public runInAction(action: () => void): void {
    this.reactionOnValidatorDisposers.push(
      reaction(
        () => action(),
        () => this.checkGroupValidations(),
      ),
    );
  }

  public get formData(): TControlsValues {
    const result: Record<string, any> = {};
    for (const key in this.controls) {
      const control = this.controls[key];
      if (control) {
        if (control instanceof FormGroup) {
          result[key] = control.formData;
        } else if (control instanceof FormControl) {
          result[key] = control.value;
        }
      }
    }
    return result as TControlsValues;
  }

  public updateFormData(data: Partial<TControlsValues>) {
    for (const key in data) {
      const control = this.controls[key];
      if (control) {
        const value = data[key];
        if (control instanceof FormGroup) {
          control.updateFormData(value as any);
        } else if (control instanceof FormControl) {
          if (!this.comparer(value, control.value)) {
            control.value = value;
          }
        }
      }
    }
  }
}
