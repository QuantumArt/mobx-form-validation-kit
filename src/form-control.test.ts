import { FormControl, FormGroup, required, ValidationEvent, wrapperActivateValidation, wrapperSequentialCheck } from '.';
import { observable } from 'mobx';
import { FormArray } from './form-array';
import { ValidationEventTypes } from './validation-event-types';
import { GroupControls } from './events';

describe('FormControl', () => {
  it('should not call setter when initialized by default', async () => {
    const setter = jest.fn<void, [string]>();

    const form = new FormGroup({
      field: new FormControl<string>('test', [required()], {
        onSelectValidValue: setter,
        callSelectValidValueOnInitialize: false,
      }),
    });
    await form.wait();

    expect(setter).not.toBeCalled();
  });

  it('should call setter once when value is changed', async () => {
    const setter = jest.fn<void, [string]>();

    const form = new FormGroup({
      field: new FormControl<string>('test', [required()], {
        onSelectValidValue: setter,
        callSelectValidValueOnInitialize: false,
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
      field: new FormControl<string>(() => model.field, [required()], {
        onSelectValidValue: setter,
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
      field: new FormControl<string>(() => model.field, [required()], {
        onSelectValidValue: setter,
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

    interface IForm extends GroupControls {
      primaryField: FormControl<string>;
      dependentField: FormControl<string>;
    }

    class Component {
      @observable form: FormGroup<IForm> = new FormGroup({
        primaryField: new FormControl<string>('foo', [required()], {
          onSelectValidValue: primarySetter,
          callSelectValidValueOnInitialize: false,
        }),
        dependentField: new FormControl<string>('bar', [required()], {
          onSelectValidValue: dependentSetter,
          activate: () => this.form && this.form.controls.primaryField.value === 'foo',
          callSelectValidValueOnInitialize: false,
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

    interface IForm extends GroupControls {
      primaryField: FormControl<number>;
      dependentField: FormControl<string>;
    }

    class Component {
      @observable form: FormGroup<IForm> = new FormGroup({
        primaryField: new FormControl<number>(123, [required() as any], {
          onSelectValidValue: primarySetter,
          callSelectValidValueOnInitialize: false,
        }),
        dependentField: new FormControl<string>('bar', [required()], {
          onSelectValidValue: dependentSetter,
          activate: () => this.form && this.form.controls.primaryField.value === 456,
          callSelectValidValueOnInitialize: false,
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
      [new FormControl<string>('', []), new FormControl<string>('', [])],
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
      ],
    );
    await form.wait();
    expect(form.valid).toBe(true);

    form.get(1).value = 'test';
    await form.wait();

    expect(form.valid).toBe(false);
  });

  it('wrapper on array', async () => {
    const form = new FormArray(
      [new FormControl<string>('', []), new FormControl<string>('', [])],
      [wrapperSequentialCheck([wrapperActivateValidation(() => true, [])])],
    );

    await form.wait();

    expect(form.valid).toBe(true);
  });
});
