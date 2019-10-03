import { action, computed, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { AbstractControl } from './abstract-control';
import { FormAbstractGroup } from './form-abstract-group';
import { ControlTypes } from './сontrol-types';
import { ValidatorFunctionFormArrayHandler } from './events';
import { FormAbstractControl } from './form-abstract-control';
import { ValidationEvent } from './validation-event';

export class FormArray<TControl extends AbstractControl> extends FormAbstractGroup {
  public readonly type: ControlTypes = ControlTypes.Array;
  private readonly reactionOnIsActiveDisposer: IReactionDisposer;

  @observable
  private controls: TControl[];
  @computed
  public get length(): number {
    return this.controls.length;
  }

  private readonly validators: ValidatorFunctionFormArrayHandler<TControl>[] = [];

  constructor(
    /** FormControls */
    controls: TControl[] = [],
    /** 
     * Validators
     * / Валидации
     */
    validators: ValidatorFunctionFormArrayHandler<TControl>[] = [],
    /** 
     * Function enable validation by condition (always enabled by default)
     * / Функция включение валидаций по условию (по умолчанию включено всегда)
     */
    activate: (() => boolean) | null = null,
  ) {
    super(activate);
    this.inProcessing = false;
    this.controls = controls;
    this.validators = validators;

    this.reactionOnIsActiveDisposer = reaction(
      () => this.isActive,
      () => {
        this.checkArrayValidations();
        this.onChange.call();
      },
    );

    for (const control of this.controls) {
      control.onChange.add(() => {
        this.serverErrors = [];
        this.checkArrayValidations();
        this.onChange.call();
      });
    }

    this.checkArrayValidations();
  }

  public dispose = (): void => {
    this.baseDispose();
    this.reactionOnIsActiveDisposer();
    for (const control of this.controls) {
      control.dispose();
    }
  };

  @action
  private checkArrayValidations = () => {
    this.inProcessing = true;
    this.onValidation(this.validators, this.checkArrayValidations, () =>
      runInAction(() => {
        this.inProcessing = false;
      }),
    );
  };

  @action
  public setDirty = (dirty: boolean) => {
    for (const control of this.controls) {
      control.setDirty(dirty);
    }
  };

  @action
  public setTouched = (touched: boolean) => {
    for (const control of this.controls) {
      control.setTouched(touched);
    }
  };

  @action
  public allControls(): FormAbstractControl[] {
    let controls: FormAbstractControl[] = [];
    for (const control of this.controls.map(c => c as AbstractControl)) {
      if (control.type === ControlTypes.Control) {
        controls.push(control as FormAbstractControl);
      } else if (control.type === ControlTypes.Group || control.type === ControlTypes.Array) {
        controls = controls.concat((control as FormAbstractGroup).allControls());
      }
    }
    return controls;
  }

  public executeAsyncValidation = (validator: (control: FormArray<TControl>) => Promise<ValidationEvent[]>): Promise<ValidationEvent[]> =>
    this.baseExecuteAsyncValidation(validator, () => {
      this.serverErrors = [];
      this.checkArrayValidations();
    });

  /**
   * Removes the last element from an array and returns it.
   */
  @action
  public pop = (): TControl | undefined => {
    const removeControl = this.controls.pop();
    this.onChange.call();
    return removeControl;
  };

  /**
   * Appends new elements to an array, and returns the new length of the array.
   * @param items New elements of the Array.
   */
  @action
  public push = (...items: TControl[]): number => {
    const newIndex = this.controls.push(...items);
    this.onChange.call();
    return newIndex;
  };

  /**
   * Combines two or more arrays.
   * @param items Additional items to add to the end of array1.
   */
  @action
  public concat = (...items: (TControl | ConcatArray<TControl>)[]): TControl[] => {
    return this.controls.concat(...items);
  };

  /**
   * Combines two or more arrays.
   * @param items Additional items to add to the end of array1.
   */
  @action
  public clear = () => {
    this.controls = [];
    this.onChange.call();
  };

  /**
   * Reverses the elements in an Array.
   */
  @action
  public reverse = (): TControl[] => {
    return this.controls.reverse();
  };

  /**
   * Removes the first element from an array and returns it.
   */
  @action
  public shift = (): TControl | undefined => {
    return this.controls.shift();
  };

  /**
   * Returns a section of an array.
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array.
   */
  public slice = (start?: number, end?: number): TControl[] => {
    return this.controls.slice(start, end);
  };

  /**
   * Sorts an array.
   * @param compareFn The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
   */
  @action
  public sort = (compareFn?: (a: TControl, b: TControl) => number) => {
    return this.controls.slice().sort(compareFn);
  };

  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   */
  public splice = (start: number, deleteCount?: number): TControl[] => {
    return this.controls.splice(start, deleteCount);
  };

  /**
   * Inserts new elements at the start of an array.
   * @param items  Elements to insert at the start of the Array.
   */
  public unshift = (...items: TControl[]): number => {
    return this.controls.unshift(...items);
  };

  /**
   * Returns the index of the first occurrence of a value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  public indexOf = (searchElement: TControl, fromIndex?: number): number => {
    return this.controls.indexOf(searchElement, fromIndex);
  };

  /**
   * Returns the index of the last occurrence of a specified value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
   */
  public lastIndexOf = (searchElement: TControl, fromIndex?: number): number => {
    return this.controls.lastIndexOf(searchElement, fromIndex);
  };

  /**
   * Determines whether all the members of an array satisfy the specified test.
   * @param callbackfn A function that accepts up to three arguments. The every method calls the callbackfn function for each element in array1 until the callbackfn returns false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public every = (callbackfn: (value: TControl, index: number, array: TControl[]) => unknown, thisArg?: any): boolean => {
    return this.controls.every(callbackfn, thisArg);
  };

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   * @param callbackfn A function that accepts up to three arguments. The some method calls the callbackfn function for each element in array1 until the callbackfn returns true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public some = (callbackfn: (value: TControl, index: number, array: TControl[]) => unknown, thisArg?: any): boolean => {
    return this.controls.some(callbackfn, thisArg);
  };

  /**
   * Performs the specified action for each element in an array.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public forEach = (callbackfn: (value: TControl, index: number, array: TControl[]) => void, thisArg?: any): void => {
    return this.controls.forEach(callbackfn, thisArg);
  };

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public map = <U>(callbackfn: (value: TControl, index: number, array: TControl[]) => U, thisArg?: any): U[] => {
    return this.controls.map(callbackfn, thisArg);
  };

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public filter = (callbackfn: (value: TControl, index: number, array: TControl[]) => unknown, thisArg?: any): TControl[] => {
    return this.controls.filter(callbackfn, thisArg);
  };

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  public reduce = <U>(callbackfn: (previousValue: U, currentValue: TControl, currentIndex: number, array: TControl[]) => U, initialValue?: U): U => {
    return this.controls.reduce(callbackfn, initialValue);
  };

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  public reduceRight = <U>(
    callbackfn: (previousValue: U, currentValue: TControl, currentIndex: number, array: TControl[]) => U,
    initialValue: U,
  ): U => {
    return this.controls.reduce(callbackfn, initialValue);
  };

  protected abbreviatedAND = (getData: (control: AbstractControl) => boolean) => {
    for (const control of this.controls) {
      if (!getData(control)) {
        return false;
      }
    }
    return true;
  };

  protected abbreviatedOR = (getData: (control: AbstractControl) => boolean) => {
    for (const control of this.controls) {
      if (getData(control)) {
        return true;
      }
    }
    return false;
  };
}
