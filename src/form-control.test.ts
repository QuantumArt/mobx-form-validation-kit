import { observable } from 'mobx';
import { ControlsCollection } from './abstract-control';
import { FormArray } from './form-array';
import { FormControl } from './form-control';
import { FormGroup } from './form-group';
import { ValidationEvent } from './validation-event';
import { ValidationEventTypes } from './validation-event-types';
import { maxValueValidator, minValueValidator, patternValidator, requiredValidator, wrapperActivateValidation, wrapperSequentialCheck } from './validators';

describe('FormControl', () => {
  it('should not call setter when initialized by default', async () => {
    const setter = jest.fn<void, [string]>();

    const form = new FormGroup({
      field: new FormControl<string>('test', {
        validators: [requiredValidator()],
        onChangeValidValue: setter,
        callSetterOnInitialize: false,
      }),
    });
    await form.wait();

    expect(setter).not.toBeCalled();
  });

  it('should call setter once when value is changed', async () => {
    const setter = jest.fn<void, [string]>();

    const form = new FormGroup({
      field: new FormControl<string>('test', {
        validators: [requiredValidator()],
        onChangeValidValue: setter,
        callSetterOnInitialize: false,
      }),
    });
    await form.wait();

    form.controls.field.value = 'qwerty';
    await form.wait();

    expect(setter).toBeCalledTimes(1);
    expect(setter).toBeCalledWith('qwerty');
  });

  it('should reflect initial value getter changes', async () => {
    const model = observable({ field: 'test' });

    const setter = jest.fn<void, [string]>();

    const form = new FormGroup({
      field: new FormControl<string>(() => model.field, {
        validators: [requiredValidator()],
        onChangeValidValue: setter,
      }),
    });
    await form.wait();

    expect(form.controls.field.value).toEqual('test');

    model.field = 'qwerty';
    await form.wait();

    expect(form.controls.field.value).toEqual('qwerty');
  });

  it('should not call setter when reinitialized by default', async () => {
    const model = observable({ field: 'test' });

    const setter = jest.fn<void, [string]>();

    const form = new FormGroup({
      field: new FormControl<string>(() => model.field, {
        validators: [requiredValidator()],
        onChangeValidValue: setter,
        callSetterOnInitialize: false
      }),
    });
    await form.wait();

    model.field = 'qwerty';
    await form.wait();

    expect(setter).not.toBeCalled();
  });

  it('should not call setter when activated during initialization', async () => {
    const primarySetter = jest.fn<void, [string]>();
    const dependentSetter = jest.fn<void, [string]>();

    interface IForm extends ControlsCollection {
      primaryField: FormControl<string>;
      dependentField: FormControl<string>;
    }

    class Component {
      @observable form: FormGroup<IForm> = new FormGroup({
        primaryField: new FormControl<string>('foo', {
          validators: [requiredValidator()],
          onChangeValidValue: primarySetter,
          callSetterOnInitialize: false,
        }),
        dependentField: new FormControl<string>('bar', {
          validators: [requiredValidator()],
          onChangeValidValue: dependentSetter,
          activate: () => this.form && this.form.controls.primaryField.value === 'foo',
          callSetterOnInitialize: false,
        }),
      });
    }

    const component = new Component();

    await component.form.wait();

    expect(primarySetter).not.toBeCalled();
    expect(dependentSetter).not.toBeCalled();
  });

  it('should call setter once when activated after initialization', async () => {
    const primarySetter = jest.fn<void, [number]>();
    const dependentSetter = jest.fn<void, [string]>();

    interface IForm extends ControlsCollection {
      primaryField: FormControl<number>;
      dependentField: FormControl<string>;
    }

    class Component {
      @observable form: FormGroup<IForm> = new FormGroup({
        primaryField: new FormControl<number>(123, {
          validators: [requiredValidator() as any],
          onChangeValidValue: primarySetter,
          callSetterOnInitialize: false,
        }),
        dependentField: new FormControl<string>('bar', {
          validators: [requiredValidator()],
          onChangeValidValue: dependentSetter,
          activate: () => this.form && this.form.controls.primaryField.value === 456,
          callSetterOnInitialize: false,
        }),
      });
    }

    const component = new Component();
    await component.form.wait();

    component.form.controls.primaryField.value = 456;
    await component.form.wait();

    expect(primarySetter).toBeCalledTimes(1);
    expect(primarySetter).toBeCalledWith(456);
    expect(dependentSetter).toBeCalledTimes(1);
    expect(dependentSetter).toBeCalledWith('bar');
  });

  it('test array', async () => {
    const form = new FormArray(
      [new FormControl<string>(''), new FormControl<string>('')],
      {
        validators:
          [
            async (array: FormArray<FormControl<string>>): Promise<ValidationEvent[]> => {
              if (array.some(i => !!i.value)) {
                return [
                  {
                    message: '',
                    type: ValidationEventTypes.Error,
                  },
                ];
              }
              return [];
            },
          ]
      },
    );
    await form.wait();
    expect(form.valid).toBe(true);

    form.get(1).value = 'test';
    await form.wait();

    expect(form.valid).toBe(false);
  });

  it('wrapper on array', async () => {
    const form = new FormArray(
      [new FormControl<string>(''), new FormControl<string>('')],
      {
        validators:
          [wrapperSequentialCheck([wrapperActivateValidation(() => true, [])])]
      },
    );

    await form.wait();

    expect(form.valid).toBe(true);
  });

  it('minValue and maxValue', async () => {
    const form = new FormGroup({
      count: new FormControl<number>(0, {
        validators: [minValueValidator<number>(1, 'Должна быть оценка'), maxValueValidator<number>(5, 'Должна быть оценка')]
      }),
    });

    await form.wait();
    expect(form.valid).toBe(false);

    form.controls.count.value = 3;

    await form.wait();
    expect(form.valid).toBe(true);
  });

  it('activate validation', async () => {
    class Component {
      @observable activateValidation: boolean = false;
    }

    const component = new Component();
    const form = new FormGroup({
      str: new FormControl<string>('', {
        validators: [wrapperActivateValidation(() => component.activateValidation, [requiredValidator()])]
      }),
    });

    await form.wait();
    expect(form.valid).toBe(true);

    component.activateValidation = true;

    await form.wait();
    expect(form.valid).toBe(false);
  });

  it('wrapper sequential check', async () => {
    const form = new FormGroup({
      date: new FormControl<string | null>('10.10.1010', {
        validators: [
          wrapperSequentialCheck([requiredValidator(), patternValidator(/^\d\d.\d\d.\d\d\d\d$/, 'Введите дату в формате "дд.мм.гггг"')]
          ),
        ]
      }),
    });

    await form.wait();
    expect(form.valid).toBe(true);

    form.controls.date.value = '10101010';

    await form.wait();
    expect(form.valid).toBe(false);
  });

  it('wrapper on array', async () => {
    const form = new FormArray([new FormControl<string>(''), new FormControl<string>('')], {
      validators: [wrapperSequentialCheck([wrapperActivateValidation(() => true, [])])],
    });

    await form.wait();
    expect(form.map(e => e).length).toBe(2);
    expect(form.allControls().length).toBe(2);

    expect(form.valid).toBe(true);
  });
});
