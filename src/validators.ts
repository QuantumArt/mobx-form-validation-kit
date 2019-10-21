import { combineErrors } from './utilites';
import { AbstractControl } from './abstract-control';
import { FormControl } from './form-control';
import { ValidatorFunctionFormControlHandler } from './events';
import { ValidationEventTypes } from './validation-event-types';
import { ValidationEvent } from './validation-event';

export const requiredValidator = 'required';
export const required = <TEntity>(message: string = 'Поле обязательно', eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (control.value == null || ((control.value as any) as string) === '') {
      return [
        {
          message,
          key: requiredValidator,
          type: eventType,
        },
      ];
    }
    return [];
  };
};

export const notEmptyOrSpacesValidator = 'notEmptyOrSpaces';
export const notEmptyOrSpaces = (message: string = 'Отсутствует значение', eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value != null && control.value.trim() !== '') {
      return [];
    }
    return [
      {
        message,
        key: notEmptyOrSpacesValidator,
        type: eventType,
      },
    ];
  };
};

export const patternValidator = 'pattern';
/**
 * Error if there is no pattern matching
 * / Ошибка, если нет соответствия паттерну
 */
export const pattern = (regExp: RegExp, message: string = 'Присутствуют недопустимые символы', eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (regExp.test(control.value)) {
      return [];
    }
    return [
      {
        message,
        key: patternValidator,
        type: eventType,
      },
    ];
  };
};

/**
 * Error if there is a pattern match
 * / Ошибка, если есть соответствие паттерну
 */
export const invertPattern = (regExp: RegExp, message: string = 'Присутствуют недопустимые символы', eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (regExp.test(control.value)) {
      return [
        {
          message,
          key: patternValidator,
          type: eventType,
        },
      ];
    }
    return [];
  };
};

export const minLengthValidator = 'minlength';
export const minLength = (minlength: number, message: string = `Минимальная длина ${minlength}`, eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value == null || minlength <= control.value.length || control.value === '') {
      return [];
    }
    return [
      {
        message,
        key: minLengthValidator,
        type: eventType,
      },
    ];
  };
};

export const maxLengthValidator = 'maxlength';
export const maxLength = (maxlength: number, message: string = `Максимальная длина ${maxlength}`, eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value == null || control.value.length <= maxlength) {
      return [];
    }
    return [
      {
        message,
        key: maxLengthValidator,
        type: eventType,
      },
    ];
  };
};

export const absoluteLengthValidator = 'absoluteLength';
export const absoluteLength = (length: number, message: string = `Длина отлична от ${length}`, eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value == null || control.value.length === length) {
      return [];
    }
    return [
      {
        message,
        key: maxLengthValidator,
        type: eventType,
      },
    ];
  };
};

export const minValueValidator = 'minValue';
export const minValue = <TEntity extends number | Date>(
  min: TEntity | (() => TEntity),
  message: string = 'Дата слишком маленькая',
  eventType = ValidationEventTypes.Error,
) => {
  const getMin: () => TEntity = typeof min === 'function' ? min : () => min;
  return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (control.value == null) {
      return [];
    }
    if (control.value < getMin()) {
      return [
        {
          message,
          key: minValueValidator,
          type: eventType,
        },
      ];
    }
    return [];
  };
};

export const maxValueValidator = 'minValue';
export const maxValue = <TEntity extends number | Date>(
  max: TEntity | (() => TEntity),
  message: string = 'Дата слишком большая',
  eventType = ValidationEventTypes.Error,
) => {
  const getMax: () => TEntity = typeof max === 'function' ? max : () => max;
  return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (control.value == null) {
      return [];
    }
    if (getMax() < control.value) {
      return [
        {
          message,
          key: maxValueValidator,
          type: eventType,
        },
      ];
    }
    return [];
  };
};

export const notContainSpacesValidator = 'notContainSpaces';
/**
 * Not contain spaces
 * / Не содержит проблелов
 */
export const notContainSpaces = (message: string = 'Не должен содержать пробелы', eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value == null || !/\s/.test(control.value)) {
      return [];
    }
    return [
      {
        message,
        key: notContainSpacesValidator,
        type: eventType,
      },
    ];
  };
};

export const compairValidator = 'compair';
/**
 * Wrapper for complex validation (error if validation returns false)
 * / Обёртка для сложной проверки (ошибка, если проверка вернула false)
 */
export const compare = <TEntity>(
  expression: (value: TEntity) => boolean,
  message: string = 'Поле не валидно',
  eventType = ValidationEventTypes.Error,
) => {
  return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (await expression(control.value)) {
      return [];
    }
    return [
      {
        message,
        key: compairValidator,
        type: eventType,
      },
    ];
  };
};

export const isEqualValidator = 'isEqual';
/**
 * Equals to {value}
 * / Равно значению {value}
 */
export const isEqual = (value: string, message: string = 'Поля не совпадают', eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value == null || control.value !== value) {
      return [];
    }
    return [
      {
        message,
        key: isEqualValidator,
        type: eventType,
      },
    ];
  };
};

/**
 * Runs validations only if activation conditions are met
 * / Запускает валидации только если условие активации выполнено
 */
export const wrapperActivateValidation = <TAbstractControl extends AbstractControl>(
  activate: () => boolean,
  validators: ((control: TAbstractControl) => Promise<ValidationEvent[]>)[],
  elseValidators: ((control: TAbstractControl) => Promise<ValidationEvent[]>)[] = [],
) => {
  return async (control: TAbstractControl): Promise<ValidationEvent[]> => {
    if (activate()) {
      const validations = await Promise.all(validators.map(validator => control.executeAsyncValidation(validator)));
      return combineErrors(validations);
    }
    if (elseValidators && elseValidators.length > 0) {
      const validations = await Promise.all(elseValidators.map(validator => control.executeAsyncValidation(validator)));
      return combineErrors(validations);
    }
    return [];
  };
};

/**
 * Wrapper for sequential validations (The next validation is launched only after the previous one passed without errors)
 * / Обертка для последовательных валидаций (Следующая валидация запускается, только после того, что предыдущая прошла без ошибок)
 */
export const wrapperSequentialCheck = <TEntity>(validators: ValidatorFunctionFormControlHandler<TEntity>[]) => {
  return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    for (const validator of validators) {
      const validationResult = await control.executeAsyncValidation(validator);
      if (validationResult.length > 0) {
        return validationResult;
      }
    }
    return [];
  };
};
