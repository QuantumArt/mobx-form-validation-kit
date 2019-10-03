import { FormControl, ValidationEvent, ValidationEventTypes, ValidatorFunctionFormControlHandler, combineErrors, AbstractControl } from './index';

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
/** Ошибка если нет соответствия паттерну */
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

/** Ошибка если есть соответствие паттерну */
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

export const birthDayValidator = 'birthDay';
export const birthDay = <TEntity extends string>(message: string = 'Дата некорректна', eventType = ValidationEventTypes.Error) => {
  const min: number = new Date(new Date().setFullYear(new Date().getFullYear() - 118)).getTime();
  const max: number = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).getTime();
  const pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
  return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (control.value == null) {
      return [];
    }
    const date: Date | String = new Date(control.value.replace(pattern, '$3-$2-$1'));
    if (isNaN(date.getTime())) {
      return [
        {
          message: 'Дата некорректна',
          key: minValueValidator,
          type: eventType,
        },
      ];
    }
    if (date.getTime() > max) {
      return [
        {
          message: 'Дата слишком большая',
          key: minValueValidator,
          type: eventType,
        },
      ];
    }
    if (date.getTime() < min) {
      return [
        {
          message: 'Дата некорректна',
          key: minValueValidator,
          type: eventType,
        },
      ];
    }
    return [];
  };
};

export const onlyLetterValidator = 'onlyLetter';
export const onlyLetter = <TEntity extends string | null>(message: string = 'Неверный формат', eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl<TEntity>): Promise<ValidationEvent[]> => {
    if (control.value == null || control.value === '') {
      return [];
    }
    const regExp = new RegExp('^[a-zA-Zа-яА-ЯёЁ-]+$', 'gi');
    if (!regExp.test(control.value)) {
      return [
        {
          message,
          key: onlyLetterValidator,
          type: eventType,
        },
      ];
    }
    return [];
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

export const notZeroValidator = 'notZero';
/** не равно 0 */
export const notZero = (message: string = 'Не должен быть равен 0', eventType = ValidationEventTypes.Error) => {
  return async (control: FormControl): Promise<ValidationEvent[]> => {
    if (control.value !== '0') {
      return [];
    }
    return [
      {
        message,
        key: notZeroValidator,
        type: eventType,
      },
    ];
  };
};

export const notContainSpacesValidator = 'notContainSpaces';
/** не содержит проблелов */
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
/** обёртка для сложной проверки (ошибка если проверка вернула false) */
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
/** равно значению {value} **/
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

/** Запускает валидации только после проверки, что поле НЕ является 0 */
export const wrapperZero = (validators: ValidatorFunctionFormControlHandler<string>[]) => {
  return async (control: FormControl<string>): Promise<ValidationEvent[]> => {
    if (control.value == null || control.value === '' || control.value === '0') {
      return [];
    }
    const validations = await Promise.all(validators.map(validator => control.executeAsyncValidation(validator)));
    return combineErrors(validations);
  };
};

/** Запускает валидации только после проверки, что поле НЕ является 0 */
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

/** Следующая валидация запускается, только после того, что предыдущая прошла без ошибок */
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