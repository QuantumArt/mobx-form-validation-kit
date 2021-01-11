import { combineErrors } from './utilites';
import { AbstractControl, ValidatorsFunction } from './abstract-control';
import { FormControl } from './form-control';
import { ValidationEventTypes } from './validation-event-types';
import { ValidationEvent } from './validation-event';

export const requiredValidatorKey = 'required';
export const requiredValidator = <TEntity>(
  message: string = 'Поле обязательно',
  eventType = ValidationEventTypes.Error
): ValidatorsFunction<FormControl<TEntity>> =>
  async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (control.value == null || ((control.value as any) as string) === '') {
      return [
        {
          message,
          key: requiredValidatorKey,
          type: eventType,
        },
      ];
    }
    return [];
  };

export const notEmptyOrSpacesValidatorKey = 'notEmptyOrSpaces';
export const notEmptyOrSpacesValidator = (
  message: string = 'Отсутствует значение',
  eventType = ValidationEventTypes.Error
): ValidatorsFunction<FormControl<string>> =>
  async (control: FormControl<string> | FormControl<string | null>): Promise<ValidationEvent[]> => {
    if (control.value != null && control.value.trim() !== '') {
      return [];
    }
    return [
      {
        message,
        key: notEmptyOrSpacesValidatorKey,
        type: eventType,
      },
    ];
  };

export const notContainSpacesValidatorKey = 'notContainSpaces';
/**
 * Not contain spaces
 * / Не содержит проблелов
 */
export const notContainSpacesValidator = (
  message: string = 'Не должен содержать пробелы',
  eventType = ValidationEventTypes.Error
) => async (control: FormControl): Promise<ValidationEvent[]> => {
  if (control.value == null || !/\s/.test(control.value)) {
    return [];
  }
  return [
    {
      message,
      key: notContainSpacesValidatorKey,
      type: eventType,
    },
  ];
};


export const patternValidatorKey = 'pattern';
/**
 * Error if there is no pattern matching
 * / Ошибка, если нет соответствия паттерну
 */
export const patternValidator = <TAbstractControl extends FormControl<string> | FormControl<string | null>>(
  regExp: RegExp,
  message: string = 'Присутствуют недопустимые символы',
  eventType = ValidationEventTypes.Error,
): ValidatorsFunction<TAbstractControl> =>
  async (control: TAbstractControl): Promise<ValidationEvent[]> => {
    if (control.value != null && regExp.test(control.value)) {
      return [];
    }
    return [
      {
        message,
        key: patternValidatorKey,
        type: eventType,
      },
    ];
  };

/**
 * Error if there is a pattern match
 * / Ошибка, если есть соответствие паттерну
 */
export const invertPatternValidator =
  <TAbstractControl extends FormControl<string> | FormControl<string | null>>(
    regExp: RegExp,
    message: string = 'Присутствуют недопустимые символы',
    eventType = ValidationEventTypes.Error,
  ): ValidatorsFunction<TAbstractControl> =>
    async (control: TAbstractControl): Promise<ValidationEvent[]> => {
      if (control.value != null && regExp.test(control.value)) {
        return [
          {
            message,
            key: patternValidatorKey,
            type: eventType,
          },
        ];
      }
      return [];
    };

export const minLengthValidatorKey = 'minlength';
export const minLengthValidator = (
  minlength: number,
  message: string = `Минимальная длина ${minlength}`,
  eventType = ValidationEventTypes.Error
): ValidatorsFunction<FormControl> =>
  async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value == null || minlength <= control.value.length || control.value === '') {
      return [];
    }
    return [
      {
        message,
        key: minLengthValidatorKey,
        type: eventType,
      },
    ];
  };

export const maxLengthValidatorKey = 'maxlength';
export const maxLengthValidator = (
  maxlength: number,
  message: string = `Максимальная длина ${maxlength}`,
  eventType = ValidationEventTypes.Error
): ValidatorsFunction<FormControl> =>
  async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value == null || control.value.length <= maxlength) {
      return [];
    }
    return [
      {
        message,
        key: maxLengthValidatorKey,
        type: eventType,
      },
    ];
  };

export const absoluteLengthValidatorKey = 'absoluteLength';
export const absoluteLengthValidator = (
  length: number,
  message: string = `Длина отлична от ${length}`,
  eventType = ValidationEventTypes.Error
): ValidatorsFunction<FormControl> => async (control: FormControl): Promise<ValidationEvent[]> => {
  if (control.value == null || control.value.length === length) {
    return [];
  }
  return [
    {
      message,
      key: absoluteLengthValidatorKey,
      type: eventType,
    },
  ];
};

export const minValueValidatorKey = 'minValue';
export const minValueValidator = <TEntity extends string | null | number | Date>(
  min: TEntity | (() => TEntity),
  message: string = 'Значение слишком маленькое',
  eventType = ValidationEventTypes.Error,
) => {
  const getMin: () => TEntity = typeof min === 'function' ? min : () => min;
  return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (control.value == null) {
      return [];
    }
    const minValue = getMin();
    let value: any = control.value;
    if (typeof value === 'string') {
      if (typeof minValue === 'number') {
        value = +value;
      } else if (minValue instanceof Date) {
        value = new Date(value);
      }
    }
    if (value < minValue) {
      return [
        {
          message,
          key: minValueValidatorKey,
          type: eventType,
        },
      ];
    }
    return [];
  };
};

export const maxValueValidatorKey = 'minValue';
export const maxValueValidator =
  <TEntity extends string | null | number | Date>(
    max: TEntity | (() => TEntity),
    message: string = 'Значение слишком большое',
    eventType = ValidationEventTypes.Error,
  ) => {
    const getMax: () => TEntity = typeof max === 'function' ? max : () => max;
    return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
      if (control.value == null) {
        return [];
      }
      const maxValue = getMax();
      let value: any = control.value;
      if (typeof value === 'string') {
        if (typeof maxValue === 'number') {
          value = +value;
        } else if (maxValue instanceof Date) {
          value = new Date(value);
        }
      }
      if (maxValue < value) {
        return [
          {
            message,
            key: maxValueValidatorKey,
            type: eventType,
          },
        ];
      }
      return [];
    };
  };

export const compairValidatorKey = 'compair';
/**
 * Wrapper for complex validation (error if validation returns false)
 * / Обёртка для сложной проверки (ошибка, если проверка вернула false)
 */
export const compareValidator = <TEntity>(
  expression: (value: TEntity) => boolean,
  message: string = 'Поле не валидно',
  eventType = ValidationEventTypes.Error,
): ValidatorsFunction<FormControl<TEntity>> =>
  async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (expression(control.value)) {
      return [];
    }
    return [
      {
        message,
        key: compairValidatorKey,
        type: eventType,
      },
    ];
  };

export const isEqualValidatorKey = 'isEqual';
/**
 * Equals to {value}
 * / Равно значению {value}
 */
export const isEqualValidator = <TEntity>(
  value: TEntity,
  message: string = 'Поля не совпадают',
  eventType = ValidationEventTypes.Error
): ValidatorsFunction<FormControl<TEntity>> =>
  async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (control.value == null || control.value !== value) {
      return [];
    }
    return [
      {
        message,
        key: isEqualValidatorKey,
        type: eventType,
      },
    ];
  };

/**
 * Runs validations only if activation conditions are met
 * / Запускает валидации только если условие активации выполнено
 */
export const wrapperActivateValidation = <TAbstractControl extends AbstractControl>(
  activate: (control: TAbstractControl) => boolean,
  validators: ValidatorsFunction<TAbstractControl>[],
  elseValidators: ValidatorsFunction<TAbstractControl>[] = [],
): ValidatorsFunction<TAbstractControl> => async (control: TAbstractControl): Promise<ValidationEvent[]> => {
  if (activate(control)) {
    const validations = await Promise.all(validators.map(validator => control.executeAsyncValidation(validator)));
    return combineErrors(validations);
  }
  if (elseValidators && elseValidators.length > 0) {
    const validations = await Promise.all(elseValidators.map(validator => control.executeAsyncValidation(validator)));
    return combineErrors(validations);
  }
  return [];
};

/**
 * Wrapper for sequential validations (The next validation is launched only after the previous one passed without errors)
 * / Обертка для последовательных валидаций (Следующая валидация запускается, только после того, что предыдущая прошла без ошибок)
 */
export const wrapperSequentialCheck = <TAbstractControl extends AbstractControl>(
  validators: ValidatorsFunction<TAbstractControl>[],
): ValidatorsFunction<TAbstractControl> => async (control: TAbstractControl): Promise<ValidationEvent[]> => {
  for (const validator of validators) {
    const validationResult = await control.executeAsyncValidation(validator);
    if (validationResult.length > 0) {
      return validationResult;
    }
  }
  return [];
};
