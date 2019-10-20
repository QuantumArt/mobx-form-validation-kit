import { FormControl, FormGroup, required, AbstractControls } from './next';
import { observable } from 'mobx';

describe('FormControl', () => {
  it('should not call setter when initialized by default', async () => {
    const setter = jest.fn<void, [string]>();

    const form = new FormGroup({
      field: new FormControl<string>('test', [required()], setter),
    });
    await form.wait();

    expect(setter).not.toBeCalled();
  });

  it('should call setter once when value is changed', async () => {
    const setter = jest.fn<void, [string]>();

    const form = new FormGroup({
      field: new FormControl<string>('test', [required()], setter),
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
      field: new FormControl<string>(() => model.field, [required()], setter),
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
      field: new FormControl<string>(() => model.field, [required()], setter),
    });
    await form.wait();

    model.field = 'qwerty';
    await form.wait();

    expect(setter).not.toBeCalled();
  });

  it('should not call setter when activated during initialization by default', async () => {
    const primarySetter = jest.fn<void, [string]>();
    const dependentSetter = jest.fn<void, [string]>();

    interface IForm extends AbstractControls {
      primaryField: FormControl<string>;
      dependentField: FormControl<string>;
    }

    class Component {
      @observable form: FormGroup<IForm> = new FormGroup({
        primaryField: new FormControl<string>('foo', [required()], primarySetter),
        dependentField: new FormControl<string>('bar', [required()], dependentSetter, {
          activate: () => this.form && this.form.controls.primaryField.value === 'foo',
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

    interface IForm extends AbstractControls {
      primaryField: FormControl<number>;
      dependentField: FormControl<string>;
    }

    class Component {
      @observable form: FormGroup<IForm> = new FormGroup({
        primaryField: new FormControl<number>(123, [required()], primarySetter),
        dependentField: new FormControl<string>('bar', [required()], dependentSetter, {
          activate: () => this.form && this.form.controls.primaryField.value === 456,
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
});
