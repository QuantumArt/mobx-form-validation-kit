import { action, computed, IReactionDisposer, makeObservable, observable, reaction } from 'mobx';
import { AbstractControl, ValidatorsFunction } from './abstract-control';
import { FormAbstractGroup } from './form-abstract-group';
import { ControlTypes } from './сontrol-types';
import { ValidationEvent } from './validation-event';

export interface IOptionsFormArray<TAbstractControl extends AbstractControl> {
  /**
    * Validations
    * Валидациии
    */
  validators?: ValidatorsFunction<FormArray<TAbstractControl>>[],
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
}

export class FormArray<TAbstractControl extends AbstractControl> extends FormAbstractGroup {
  private readonly reactionOnIsActiveDisposer: IReactionDisposer;

  private controls: TAbstractControl[];

  public get length(): number {
    return this.controls.length;
  }

  private readonly validators: ValidatorsFunction<FormArray<TAbstractControl>>[] = [];

  constructor(
    /**
      * Сontrols
      * / Контролы
      */
    controls: TAbstractControl[],
    /**
     * Options
     * / Опции
     */
    options: IOptionsFormArray<TAbstractControl> = {},
  ) {
    super(options.activate ?? null, options.additionalData, ControlTypes.Array);
    makeObservable<FormArray<TAbstractControl>, 'controls' | 'checkArrayValidations'>(this, {
      controls: observable,
      length: computed,

      checkArrayValidations: action,
      pop: action,
      push: action,
      concat: action,
      clear: action,
      reverse: action,
      shift: action,
      sort: action,
    });

    this.inProcessing = false;
    this.controls = controls ?? [];
    this.validators = options.validators ?? [];

    this.reactionOnIsActiveDisposer = reaction(
      () => this.active,
      () => {
        this.checkArrayValidations();
        this.onChange.call(this);
      },
    );

    for (const control of this.controls) {
      control.onChange.addListen(() => {
        this.serverErrors = [];
        this.checkArrayValidations();
        this.onChange.call(this);
      });
    }

    this.checkArrayValidations();
  }

  public get(index: number): TAbstractControl {
    return this.controls[index];
  }

  public dispose = (): void => {
    super.dispose();
    this.reactionOnIsActiveDisposer();
    for (const control of this.controls) {
      control.dispose();
    }
  };

  public executeAsyncValidation = (validator: (control: this) => Promise<ValidationEvent[]>): Promise<ValidationEvent[]> =>
    this.baseExecuteAsyncValidation(validator, () => this.checkArrayValidations());

  private checkArrayValidations = () => {
    this.inProcessing = true;
    this.serverErrors = [];
    this.onValidation(this.validators, this.checkArrayValidations, () => this.inProcessing = false);
  };

  public runInAction(action: () => void): void {
    this.reactionOnValidatorDisposers.push(
      reaction(
        () => action(),
        () => this.checkArrayValidations()
      )
    );
  };

  /**
   * Removes the last element from an array and returns it.
   */
  public pop = (): TAbstractControl | undefined => {
    const removeControl = this.controls.pop();
    this.onChange.call(this);
    return removeControl;
  };

  /**
   * Appends new elements to an array, and returns the new length of the array.
   * @param items New elements of the Array.
   */
  public push = (...items: TAbstractControl[]): number => {
    const newIndex = this.controls.push(...items);
    this.onChange.call(this);
    return newIndex;
  };

  /**
   * Combines two or more arrays.
   * @param items Additional items to add to the end of array1.
   */
  public concat = (...items: (TAbstractControl | ConcatArray<TAbstractControl>)[]): TAbstractControl[] => {
    return this.controls.concat(...items);
  };

  /**
   * Combines two or more arrays.
   * @param items Additional items to add to the end of array1.
   */
  public clear = () => {
    this.controls = [];
    this.onChange.call(this);
  };

  /**
   * Reverses the elements in an Array.
   */
  public reverse = (): TAbstractControl[] => {
    return this.controls.reverse();
  };

  /**
   * Removes the first element from an array and returns it.
   */
  public shift = (): TAbstractControl | undefined => {
    return this.controls.shift();
  };

  /**
   * Returns a section of an array.
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array.
   */
  public slice = (start?: number, end?: number): TAbstractControl[] => {
    return this.controls.slice(start, end);
  };

  /**
   * Sorts an array.
   * @param compareFn The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
   */
  public sort = (compareFn?: (a: TAbstractControl, b: TAbstractControl) => number) => {
    return this.controls.slice().sort(compareFn);
  };

  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   */
  public splice = (start: number, deleteCount?: number): TAbstractControl[] => {
    return this.controls.splice(start, deleteCount);
  };

  /**
   * Inserts new elements at the start of an array.
   * @param items  Elements to insert at the start of the Array.
   */
  public unshift = (...items: TAbstractControl[]): number => {
    return this.controls.unshift(...items);
  };

  /**
   * Returns the index of the first occurrence of a value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  public indexOf = (searchElement: TAbstractControl, fromIndex?: number): number => {
    return this.controls.indexOf(searchElement, fromIndex);
  };

  /**
   * Returns the index of the last occurrence of a specified value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
   */
  public lastIndexOf = (searchElement: TAbstractControl, fromIndex?: number): number => {
    return this.controls.lastIndexOf(searchElement, fromIndex);
  };

  /**
   * Determines whether all the members of an array satisfy the specified test.
   * @param callbackfn A function that accepts up to three arguments. The every method calls the callbackfn function for each element in array1 until the callbackfn returns false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public every = (callbackfn: (value: TAbstractControl, index: number, array: TAbstractControl[]) => unknown, thisArg?: any): boolean => {
    return this.controls.every(callbackfn, thisArg);
  };

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   * @param callbackfn A function that accepts up to three arguments. The some method calls the callbackfn function for each element in array1 until the callbackfn returns true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public some = (callbackfn: (value: TAbstractControl, index: number, array: TAbstractControl[]) => unknown, thisArg?: any): boolean => {
    return this.controls.some(callbackfn, thisArg);
  };

  /**
   * Performs the specified action for each element in an array.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public forEach = (callbackfn: (value: TAbstractControl, index: number, array: TAbstractControl[]) => void, thisArg?: any): void => {
    return this.controls.forEach(callbackfn, thisArg);
  };

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public map = <U>(callbackfn: (value: TAbstractControl, index: number, array: TAbstractControl[]) => U, thisArg?: any): U[] => {
    return this.controls.map(callbackfn, thisArg);
  };

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  public filter = (callbackfn: (value: TAbstractControl, index: number, array: TAbstractControl[]) => unknown, thisArg?: any): TAbstractControl[] => {
    return this.controls.filter(callbackfn, thisArg);
  };

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  public reduce = <U = TAbstractControl>(
    callbackfn: (previousValue: U, currentValue: TAbstractControl, currentIndex: number, array: TAbstractControl[]) => U,
    initialValue: U,
  ): U => {
    return this.controls.reduce(callbackfn, initialValue);
  };

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  public reduceRight = <U>(
    callbackfn: (previousValue: U, currentValue: TAbstractControl, currentIndex: number, array: TAbstractControl[]) => U,
    initialValue: U,
  ): U => {
    return this.controls.reduceRight(callbackfn, initialValue);
  };

  protected *getControls(): IterableIterator<AbstractControl> {
    for (const control of this.controls) {
      yield control;
    }
  }
}
