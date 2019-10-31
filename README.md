# mobx-form-validation-kit

[![Version](https://img.shields.io/npm/v/@quantumart/mobx-form-validation-kit?style=flat)](https://www.npmjs.com/package/@quantumart/mobx-form-validation-kit)
[![License](https://img.shields.io/npm/l/@quantumart/mobx-form-validation-kit.svg?style=flat)](https://www.npmjs.com/package/@quantumart/mobx-form-validation-kit)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://www.npmjs.com/package/@quantumart/mobx-form-validation-kit)

[Документация на русском](#doc_rus)

- [Table of contents](#table-of-contents)
- [Pluses of the package](#pluses)
- [Installation](#install)
- [FormControl](#install)
- [Validation](#validation)
- [Extensions](#extensions)
- [Example](#example)
- [About the author](#about)

### Pluses of the package<a name="pluses">
- Completely in TypeScript
- Compatible with Mobx (version 4, which supports everyone's favorite IE10)
- Designed to work in React (may be used in projects without react)
- Designed for asynchronous validations
- Easy to embed in an existing project.

### Installation<a name="install">
```sh
npm install @quantumart/mobx-form-validation-kit
```
### FormControl<a name="formcontrol">

`@ quantumart/mobx-form-validation-kit` allows creating a layer between the source data and the display form. Which, in turn, allows validating them and, if necessary, changing the data before incorporating to the original object.
The `@ quantumart / mobx-form-validation-kit` library contains three main classes (validation components) for managing the form:


| Name | Description |
| ------ | ------ |
| `FormGroup` | allows combining validation components together. The class is typed and allows remaking the interface with the list of fields as a generic parameter. "Any" is specified by default, it is highly recommended not to use it without typing, despite there is a possibility. |
| `FormControl` | is used to validate a specific field, the most commonly used class. The class is typed, and it takes the type of variable, which it should store, as a generic parameter.  "String" is specified by default, because the default is string-type, as the most common option for forms. |
| `FormArray` | allows creating and managing an array of variational components. |

In addition, there are basic abstract classes

| Name | Description |
| ------ | ------ |
| `AbstractControl` | is a base class for all listed validation classes, it is not typed. |
| `FormAbstractControl` | is a base class for `FormGroup` and `FormArray,` it is not typed. |
| `FormAbstractGroup` | is a non-typed base class for FormControl, contains a link to the html element that is being rendered. |

The best practice for creating a validating form would be the following idea.
An object of the single `FormGroup` type is created for the form and the fields are listed therein
```sh
this.form = new FormGroup<IUserInfo>({
      name: new FormControl(
            this.userInfo.name,
            [],
            v => (this.userInfo.name = v)
      ),
      surname: new FormControl(
            this.userInfo.surname,
            [],
            v => (this.userInfo.surname = v)
      )
      // …
    });
```

`FormGroup` supports nesting, i.e.
```sh
this.form = new FormGroup<IUserInfo>({
      name: new FormControl(
            this.userInfo.name,
            [],
            v => (this.userInfo.name = v)
      ),
      surname: new FormControl(
            this.userInfo.surname,
            [],
           v => (this.userInfo.surname = v)
      )
      passport: new FormGroup<IPassport >({
            number: new FormControl(
                  this.userInfo.passport.number,
                  [],
                  v => (this.userInfo.passport.number = v)
              ),
              // …
      })
      // …
    });

```
`FormArray` may be added, to which in turn the `FormControl` type and/or the entire `FormGroup` may be transferred, creating objects of any complexity and structure.
- FormArray<FormControl<string>>
- FormArray<FormGroup<IUserInfo>>

`FormControl` itself takes the following set of parameters into the constructor

| Name | Description |
| ------ | ------ |
| `value` | is an initial typed value or its getter function. In the case of using the observed values ​​inside the getter function, a subscription is being performed to change them; at the end of use, it is required to call `formControl.dispose()` to unsubscribe. |
| `validators` | is a set of validators. |
| `callbackValidValue` | is a callback function, to which the last valid value is transferred. It is called every time a value in FormControl changes and this value passes the described validations. |
| `activate` | is a function, which enables/disables validations by condition (always enabled by default). For example, the validity of the end date of a service does not need to be controlled if "Unlimited" box is not checked. As a result, by simply entering a function here that checks the state of the observable field responsible for the "Unlimited" checkbox, it is possible to automatically disable all validations associated with the field for checking the date, instead of specifying this logic in each of the date field validations. |
| `additionalData` | is a block with additional information, it allows supplementing additional information to a specific `FormControl` and use it later, for example, for visualization. This is convenient if there are builders for `FormControl,` in which it is required to hardcode certain information, rather than transferring this information through a complex data bundle to the controls for visualization. Although I cannot give an exact and undeniable application scenario, it is better to have such a possibility than to suffer without it. |

There is one restriction, which is present in FormControl from Angular as well; there is no need to reuse objects on different forms. That is, it is possible to create a `FormGroup` builder and to create own object on each page. But using one object per bunch of pages is the bad practice.
Moreover, `FormControl` is initialized with a single value, and if this value is changed, the new one will not get into `FormControl.` This is done on purpose, because, as the practice has shown, for some reason, everyone first tries to edit the source object bypassing validations, instead of the value in `FormControl.` Just assign a new value to the `value` field of `FormControl` to modify the source object.
`FormGroup` takes the following set of parameters into the constructor:

| Name | Description |
| ------ | ------ |
| `controls` | is an object inherited from `AbstractControls.` Actually, just create an interface inherited from `AbstractControls,` in which you list fields of the `FormGroup,` `FormControl,` | `FormArray` types. It is of course possible to set the "any" type but in this case, all the advantages of TypeScript will be lost |
| `validators` | is a set of validators for group values. For example, it is possible to create `FormGroup` containing two values, the minimum and maximum date, for the period selection control. It is in these validators that the function/functions of validation the date range will be required to transfer. For example, that the start date does not exceed the end date |
| `activate` | is a function, which enables/disables validations by condition (always enabled by default). It should be understood that enabling the validation function to a group disables the validation at the level of the entire group. For example, we have a drop-down box for an identity document. It is possible to create several `FormGroup` with a various set of fields for documents: passport, driver’s license, seafarer's ID, etc. In this function, the drop-down box values should be validated, and if the selected value does not correspond to this group, all validation checks are disabled. To be more precise, the group will be considered valid, regardless of the values there​​in. |

Let's talk about the `FormControl` fields which are present both in `FormGroup` and in `FormArray.`

| Name | Description |
| ------ | ------ |
| `ControlTypes` | is a type of control (Control, Group, Array) |
| `processing` | means `in the process of analysis`. Because asynchronous validations are supported, for example, those that require a server request. The current state of the validation may be found in this field. |

Moreover, `FormGroup` and` FormArray` support the `wait` method, which allows waiting for the validation to complete. For example, when you click on the "send data" button, the following structure should be specified.
```sh
await this.form.wait();
	if (this.form.invalid) {
	…
```
| Name | Description |
| ------ | ------ |
| `disabled` |, an error checking is disabled (control is always valid) |
| `active` |, an error checking is enabled. Depends on the result of the activation function. This value is very convenient to use to hide a group of fields on the form and not write additional and duplicate functions of business logic. |
| `invalid` | for `FormControl` means that the field contains validation errors. For `FormGroup` and` FormArray,` this means either the very group control contains errors, or one of the nested fields (at any of the nesting levels) contains validation errors. THat is, to check the validity of the entire form, it is enough to perform a single check of "invalid" or "valid" of the upper FormGroup. |
| `valid` | for `FormControl` means that the field does not contain validation errors. For FormGroup and FormArray, this means either the very group control does not contain errors, or none of the nested fields (at any of the nesting levels) contains validation errors. |
| `pristine` | the value in the field did not change after initialization with the default value. |
| `dirty` | the value in the field changed after initialization with the default value. |
| `untouched` | for `FormControl` means that the field (for example, "input") was not in focus. For FormGroup and FormArray, this means that none of the nested FormControls was in focus. The "false" value in this field means that the focus was not only set to, but also removed from the field. |
| `touched` | for `FormControl` means that the field (for example, "input") was in focus. For `FormGroup` and` FormArray,` this means that one of the nested `FormControls` was in focus. The "true" value in this field means that the focus was not only set to, but also removed from the field. |
| `focused` | for `FormControl` means that the field (for example, "input") is now in focus. For `FormGroup` and` FormArray,` this means that one of the nested `FormControls` is now in focus. |
| `errors` | the field contains validation errors. Unlike the fields listed, this array contains exactly the errors of either `FormControl,` or `FormGroup,` or `FormArray,` i.e., errors of this control, but not of all nested ones. Affects the "valid/invalid" field |
| `warnings` | the field contains "Warning" messages.  Unlike the fields listed, this array contains exactly the errors of either FormControl, or FormGroup, or FormArray, i.e., messages of this control, but not all the embedded ones. Does not affect the "valid/invalid" field |
| `informationMessages` | the field contains informational messages.  Unlike the fields listed, this array contains exactly the errors of either FormControl, or FormGroup, or FormArray, i.e., messages of this control, but not all the embedded ones. Does not affect the "valid/invalid" field |
| `successes` | the field contains additional validity messages.  Unlike the fields listed, this array contains exactly the errors of either FormControl, or FormGroup, or FormArray, i.e., messages of this control, but not all the embedded ones. Does not affect the "valid/invalid" field |
| `maxEventLevel()` | the maximum level of validation messages that are currently in the field. The method will return one of the "enum" values within the following priority. - ValidationEventTypes.Error; - ValidationEventTypes.Warning; - ValidationEventTypes.Info; - ValidationEventTypes.Success; |
| `serverErrors` |, after sending a message to the server, it is good courtesy to check the validity of the form on the server. As a result, the server may return errors of the final form validation, and the `serverErrors` array is intended for these very errors. The key feature of `serverErrors` is automatic clearing of validation messages when the focus is lost from the field, to which server errors were assigned, and server errors are also cleared if the field has been changed. |
| onChange | in addition to the standard "mobx-reaction" mechanism, it is possible to use "delegate" and add a "callback" function to it, which will be called when data changes. |
| `setDirty(dirty: boolean)` |, the method will allow changing the value of the `pristine` / `dirty` fields |
| `setTouched(touched: boolean)` | the method will allow changing the value of the `untouched` / `touched` fields |
| `dispose()` | is required to call in componentWillUnmount of the control responsible for the page |

These were common fields for all controls, but each control also has fields unique to its type.
`FormControl`.

| Name | Description |
| ------ | ------ |
| `value` |, contains the current value of the field. It is possible to assign a new value to this field either. |

`FormGroup` and `FormArray` contain

| Name | Description |
| ------ | ------ |
| `wait()` | the method allows to wait for the end of the check of all (validations), including nested ones |
| `allControls`() | this method allows to obtain a complete set of all FormControls, including those nested at different levels. That is, it actually expands a multilevel FormGroup object, which may also contain FormGroup, into one large list consisting only of FormControls. |

The `allControls` functionality is required if we want to find the first invalid element and put focus on it.
in this case, the code would look like this:
```sh
await this.form.wait();
    if (this.form.invalid) {
      this.form.setTouched(true);
      const firstError = this.form.allControls().find(c => c.invalid && !!c.element);
      if (!!firstError) {
        firstError.element.focus();
      }
    }
...
```

### Validation <a name="validation">
Of course, in addition to controls that allow working with data, we will need validations themselves. The package `@quantumart/mobx-form-validation-kit` typically contains a number of preset validations, as well as supports the creation of own custom validations.
Example of setting validations for `FormControl` for the age field.
```sh
new FormControl<number>(
        this.userInfo.age,
        [required(), minValue(18, "Вам должно быть больше 18 лет.", ValidationEventTypes.Warning)],
        v => (this.userInfo.age = v)
      )
```
Each validation takes as the latest parameters:

| Name | Description |
| ------ | ------ |
| Message | validation message. |
| eventType | message level. 4 message levels are supported. |

- Error
- Warning
- Info
- Success (validity massages). For example, it is possible to verify that the password is really secure.

The package contains the following set of validations:

| Name | Description |
| ------ | ------ |
| `required` (... | required field |
| `notEmptyOrSpaces` (... | the field is not empty and does not contain spaces only. It is actually "required", taking into account the prohibition of spaces. |
| `pattern`(regExp: RegExp, ... | the first parameter is a regular expression that the field should match. An error is generated if there is no pattern matching. |
| `invertPattern`(regExp: RegExp, ... |, the first parameter is a regular expression that the field should not match. An error is generated if there is pattern matching. |
| `minLength`(minlength: number, .... | the first parameter is the minimum length of the text, inclusive. An error is generated if the length is less than the transferred one. |
| `maxLength`(maxlength: number, .... | the first parameter is the maximum length of the text, inclusive. An error is generated if the length exceeds the transferred one. |
| `absoluteLength`(length: number, .... | the first parameter is the exact length of the text. An error is generated if the length does not match the given one. |
| `minValue`(min: TEntity (() => TEntity), ... | this validation is intended for numbers and dates only. An error occurs if the value is less than the specified one. The validation feature is the ability to accept not only a specific value as the first parameter, but a function as well. Which means that if the value is being read in this function from the @observable field of the object, the validation itself will be restarted not only when the field requiring validation is changed but also when the "related field" is changed too. Whereupon, no additional manipulations are needed, except to mark the field from which the value is being read as @observable. |
| `maxValue`(max: TEntity (() => TEntity), ... | this validation is intended for numbers and dates only. An error occurs if the value is longer than the specified one. The validation feature is the ability to accept not only a specific value as the first parameter, but a function as well. Which means that if the value is being read in this function from the @observable field of the object, the validation itself will be restarted not only when the field requiring validation is changed but also when the "related field" is changed too. Whereupon, no additional manipulations are needed, except to mark the field, from which the value is being read as @observable |
| `notContainSpaces` (... | unlike notEmptyOrSpaces, an error will be generated if the value contains even one space. |
| `compare`(expression: (value: TEntity) => boolean (... |, writing own validation function generates a lot of copy-paste code; this wrapper has been developed to eliminate this problem. As the first parameter, this validation function accepts a function, to which in turn the current value of the field is transferred. Which allows performing a complex validation. For example, calculating a hash for TIN or passport number. And then return true/false. An error will be displayed if the validation returns false.
| `isEqual`(value: string ... | simple string match validation. |

The following describes the wrapper functions that serve to control the flow of validation launch.
It should be noted that the validation set transferred to `FormControl`, `FormGroup`, `FormArray` is launched in a single array and actually has no execution sequence. As a result of the work, in the errors, warnings, informationMessages, and successes fields, we will obtain arrays consisting of errors, warnings, etc., which are combined into a single array.
Often a customer wants to see only one error, but not all at once. Moreover, the ToR may be designed so that one validation is being performed only after the previous one has ended.
To solve this problem, the wrapperSequentialCheck wrapper is used. Its call and its application is no different from the usual validator function, but at the input, it receives an array of validators that will be launched sequentially, i.e., the next validation will be launched only after the previous one has ended without errors.
The second wrapper function is the control function of the flow of validations. As the first parameter, `wrapperActivateValidation` takes a function, in which it is required to specify the conditions for activation of validations. Unlike the "activate" function, which is transferred to FormControl, this validation is designed for more complex logic. Let us suppose that we have a common builder for the entire `FormGroup` form of payments, and moreover, there is only one method on the server that accepts a common set of fields. But the catch is that even though the form is common, we show a different set of fields to the user depending on the "type of payment." Thus, `wrapperActivateValidation` allows writing a logic, in which various validations will be performed depending on the type of payment.
The use of wrappers will look just like the use of ordinary functions.
```sh
new FormControl(
        this.userInfo.megapole,
        [wrapperActivateValidation(() => this.info.A === 10, [
                required(),
                pattern(/\^d{10}$/)
        ]),
        wrapperActivateValidation(() => this.info.A === 20, [
                wrapperSequentialCheck([
                        notContainSpaces(),
                        pattern(/\^d{20}$/)
                ])
        ])],
        v => (this.userInfo.megapole = v)
      )

```
This example shows that the required(), pattern(/\^d{10}$/) varifications will be performed only at this.info.A === 10, and if this.info.A === 20, the notContainSpaces(), pattern(/\^d{20}$/) validations will be triggered; moreover, these validations will be triggered sequentially, unlike the first case.

Of course, the moment will come when the standard set of validations will no longer be enough.
Then, it will be required to write own asynchronous functions. Fortunately, this may be done without much difficulty.
`FormControl` was originally designed for asynchronous validation functions, which may want to go to the server for data and it is required to wait such a respond. And as a result, all the validations are asynchronous.
```sh
async function checkValueOnServer(control: FormControl): Promise<ValidationEvent[]> {
    if (control.value == null) {
      return [];
    }
    const result = await sendToServer(control.value);
    if (result.errorMessage) {
      return [
        {
          message: result.errorMessage,
          type: ValidationEventTypes.Error,
        },
      ];
    }
    return [];
```
Here, it is necessary to pay attention to two objects.
The first point is the array being returned. So it is actually possible to return several error messages at once, if necessary.
The second point is the object being returned; it has the following set of fields.

| Name | Description |
| ------ | ------ |
| `key` | is an optional field, which allows specifying a "key" for a specific validation. All base fields has a unique "key" which matches their name. A desire may emerge to use "key" to render the list in "react", but as practice has shown, this is a bad idea. Further, I will show in the example that it is better to use "message" and do not touch "key" at all. In any case, it is available, as in Angunar, but the need in it is in fact reduced to null. |
| `message` | is a validation message. Mandatory field. |
| `type` | is a type of message. - Error - Warning - Info - Success (validity messages). For example, it is possible to verify that the password is really secure. |
| `additionalData` | is an additional information that may be transferred along with validation, if necessary. It may be some additional html-markup or a specific style. Generally, anything may be put into "any." |

### Extensions<a name="extensions">
Any magic is based on trifles. And in this case, it is required to link `FormControl` with a specific input field for setting focus, obtaining changes from the fields.
Since `FormControl` does not limit the developer in the type of validated data, it was required to sacrifice a bit of applicability of elements in "react," due to the versatility.
At the same time, for "input" and "textarea," it was possible to create simple functions of binding data onto an element; for other components, the processor will still have to make minimal efforts to substitute data.

For "input," the binding element on `FormControl` (name) will look like this.
`<input type="text" {...InputFormControl.bindActions(controls.name)} />`
For "textarea," the binding will be like this
`<textarea {...TextAreaFormControl.bindActions(controls.name)}/>`

`InputFormControl.bindActions` and `TextAreaFormControl.bindActions` take two parameters:

| Name | Description |
| ------ | ------ |
| `formControl` | is actually FormControl, on which the binding will fall. Mandatory parameter. |
| `events` | is an optional parameter containing a list of functions that may be called if there is a need to customize them. The point is that `bindActions` hangs the event handler functions on the "Element," and as a result, the overlapping of these events in the "element" will lead to the inoperability of either `FormControl,` or the developer function. To solve this problem, we transfer the required custom developer function to the "event" object. Currently, the following set of methods is supported. - ref - onChange - onBlur - onFocus |

When using the library, you will be able to note that the following structure is the most common option for creating `FormControls'.
```sh
this.form = new FormGroup<IUserInfo>({
    name: new FormControl(
        this.userInfo.name,
        [],
        v => (this.userInfo.name = v)
    )
});
```
The biggest problem here is the double mentioning of this.userInfo.name, both for primary initializing `FormControl` and for recording the result. Such a bunch may cause unwanted problems during the copy-paste and the `FormControl.for` function has been developed to solve them.
```sh
this.form = new FormGroup<IUserInfo>({
    name: FormControl.for(this.userInfo, 'name', [])
});
```
As may be seen, it is not now required to repeat the call to the "name name" field twice. Moreover, due to the typing capabilities in TypeScript, the "name" string is indeed traced as a field. And if there is no such field in the "userInfo" object, we will get a compilation error.

If you have read until now, you are actually a hero. :)

### Example<a name="example">
We will conduct the demonstration on the React project in TypeScript using mobx.
For an existing project, we simply add a package.
```sh
npm install @quantumart/mobx-form-validation-kit
```

The "Hello" component to the registration page. To do this, let us create the RegistrationStore class in a new RegistrationStore.ts file
src\RegistrationStore.ts
```sh
import { observable } from "mobx";

export class RegistrationStore {
@observable
public userInfo = {
    name: "Vitaly"
};
}

export const registrationStore = new RegistrationStore();

```
Let us modify the "Hello.ts" file as follows.
```sh
import * as React from "react";
import { observer } from "mobx-react";
import { registrationStore } from "../RegistrationStore";

@observer
export class Hello extends React.Component {
  private changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    registrationStore.userInfo.name = event.target.value;
  };
  render() {
    return (
      <React.Fragment>
        <h1>Здравствуйте, {registrationStore.userInfo.name}</h1>
        <div className="row">
          <span>Имя:</span>
          <input
            type="text"
            value={registrationStore.userInfo.name}
            onChange={this.changeName}
          />
        </div>
      </React.Fragment>
    );
  }
}

```
The result is an ultimately functional component, with "Store" operating through "Mobx." It is possible to see the result of operation in the form of dynamically changing texts on the page when inputting information into "input."
But there is a problem in this entire beauty. The more fields we add, the more change methods we will have to write. And after adding the “send” button, it will be required not to forget to verify all the fields taking into account their visibility. And with each new field, the amount of the copy-paste will only increase, not mentioning the complex reuse of the code.
To solve this bunch of problems
`@quantumart/mobx-form-validation-kit` has been created

First, let us create a small wrapper component to visualize errors.
stc/ErrorWraper.tsx
```sh
import * as React from "react";
import { observer } from "mobx-react";
import { FormControl } from "@quantumart/mobx-form-validation-kit";

interface Props {
  formControl: FormControl;
}

@observer
export class ErrorWraper extends React.Component<Props> {
  render() {
    return (
      <div>
        {this.props.children}
        {this.props.formControl.errors.map(error => (
          <span key={error.message} className="error">
            {error.message}
          </span>
        ))}
      </div>
    );
  }
}
```
There is nothing complicated in it; we simply display the red text of error messages, if any.

The "Hello.tsx" component is not much modified either.
First, the extra changeName method is removed. Instead of it, the binding string `{... InputFormControl.bindActions (controls.name)}` is added. It contains all the required methods that will allow responding to data changes.
Second, we added a wrapper for "input," but it is of course better to make a separate component with "input" inside, however then, for clarification, a slightly more complicated structure will be required.
Third, a function, which initializes "form" in "store," is added to the constructor; and, what is the most important, `registrationStore.form.dispose()` is recorded in `componentWillUnmount.` Without this call, the "mobx" reactions that the FromControl hangs up may still live until the page is refreshed.
```sh
import * as React from "react";
import { observer } from "mobx-react";
import { registrationStore } from "../RegistrationStore";
import { ErrorWraper } from "../ErrorWraper";
import { InputFormControl } from "@quantumart/mobx-form-validation-kit";

@observer
export class Hello extends React.Component {
  constructor(props: any) {
    super(props);
    registrationStore.initForm();
  }
  componentWillUnmount() {
    registrationStore.form.dispose();
  }
  render() {
    const controls = registrationStore.form.controls;
    return (
      <React.Fragment>
        <h1>Здравствуйте, {registrationStore.userInfo.name}</h1>
        <div className="row">
          <span>Имя:</span>
          <ErrorWraper formControl={controls.name}>
            <input
              type="text"
              {...InputFormControl.bindActions(controls.name)}
            />
          </ErrorWraper>
        </div>
      </React.Fragment>
    );
  }
}

```
The "RegistrationStore.ts" file has undergone additional changes.
it has acquired the following structure.
"UserInfo" has remained the main object (source object) with information about the user but in addition to this, a layer in the form of "form" has appeared. It is this layer that will be responsible for validations and for assigning data to the "userInfo" object.
```sh
import { observable } from "mobx";
import {
  FormControl,
  FormGroup,
  AbstractControls
} from "@quantumart/mobx-form-validation-kit";

interface IUserInfo extends AbstractControls {
  name: FormControl;
}

export class RegistrationStore {
  @observable
  public userInfo = {
    name: "Виталий"
  };

  @observable
  public form: FormGroup<IUserInfo>;

 public initForm(): void {
    this.form = new FormGroup<IUserInfo>({
      name: new FormControl(
        this.userInfo.name,
        [],
        v => (this.userInfo.name = v)
      )
    });
  }
}
export const registrationStore = new RegistrationStore();
```

### About the author<a name="about">
The package has been developed by [Quantum Art] (http://www.quantumart.ru), one of the market leaders in the development of technologically complex Internet/Intranet solutions.

- Vitaly Alferov, leading developer of the package.
- Dmitry Paniushkin, improvement and expansion of functionality.
- Ilia Stukalov, editor.

### Документация<a name="doc_rus">

- [Структура документа](#table-of-contents)
  - [Плюсы пакета](#pluses_rus)
  - [Установка](#install_rus)
  - [FormControl](#formcontrol_rus)
  - [Валидации](#validation_rus)
  - [Extensions](#extensions_rus)
  - [Пример](#example_rus)
  - [Об авторе](#about_rus)

### Плюсы пакета<a name="pluses_rus">
  - Полностью на TypeScript
  - Совместимость с Mobx (версии 4, который поддерживает, всеми любимый, IE10)
  - Рассчитан на работу в React (можно использовать в проектах и без react)
  - Рассчитан на асинхронные валидации
  - Легко встроить в существующий проект.

### Установка<a name="install_rus">
```sh
npm install @quantumart/mobx-form-validation-kit
```
### FormControl<a name="formcontrol_rus">

`@quantumart/mobx-form-validation-kit` позволяет создать прослойку между исходными данными и формой для отображения. Что, в свою очередь, позволяет валидировать их и, при необходимости, изменять данных перед тем как они попадут в исходный объект.
Библиотека `@quantumart/mobx-form-validation-kit` содержит три основных класса (валидационных компонента) для управления формой:


| Имя | Описание |
| ------ | ------ |
| `FormGroup` | позволяет объединять валидационные компоненты вместе. Класс типизированный, и позволяет переделать в качестве generic параметра интерфейс со списком полей. По умолчанию прописан any, крайне не рекомендуется использовать его без типизации, но возможность есть. |
| `FormControl` | используется для валидации конкретного поля, наиболее часто используемый класс. Класс типизированный, и в качестве generic параметра принимает тип переменной которой должен хранить.  По умолчанию прописан string, т.к. по умолчанию является строковым, как наиболее частный вариант для форм. |
| `FormArray` | вызволят создавать и управлять массивом вариационных компонентов. |

Кроме этого есть базовые абстрактные классы

| Имя | Описание |
| ------ | ------ |
| `AbstractControl` | базовый класс для всех перечисленных валидационных классов, не типизирован. |
| `FormAbstractControl` | базовый класс для `FormGroup` и `FormArray`, не типизирован. |
| `FormAbstractGroup` | не типизированный базовый класс для FormControl, содержит ссылку на html элемент который отрисовывается. |

Лучшей практикой по созданию валидирующей формы будет следующая идея.
На форму создается объект типа один `FormGroup` и в нем уже перечисляются поля
```sh
this.form = new FormGroup<IUserInfo>({
      name: new FormControl(
            this.userInfo.name,
            [],
            v => (this.userInfo.name = v)
      ),
      surname: new FormControl(
            this.userInfo.surname,
            [],
            v => (this.userInfo.surname = v)
      )
      // …
    });
```

`FormGroup` поддерживает вложенность, т.е.
```sh
this.form = new FormGroup<IUserInfo>({
      name: new FormControl(
            this.userInfo.name,
            [],
            v => (this.userInfo.name = v)
      ),
      surname: new FormControl(
            this.userInfo.surname,
            [],
           v => (this.userInfo.surname = v)
      )
      passport: new FormGroup<IPassport >({
            number: new FormControl(
                  this.userInfo.passport.number,
                  [],
                  v => (this.userInfo.passport.number = v)
              ),
              // …
      })
      // …
    });

```
Можно добавить `FormArray`, который в свою очередь может быть передан тип `FormControl` и или целый `FormGroup` создавая объекты любой сложности и структуры.
  - FormArray<FormControl<string>>
  - FormArray<FormGroup<IUserInfo>>

Сам по себе `FormControl` принимает следующий набор параметров в конструктор

| Имя | Описание |
| ------ | ------ |
| `value` | изначальное типизированное значение или его getter функцию. В случае использвания наблюдаемых значений внутри getter функции происходит подписка на их измения, по оканчанию использования обязательно нужно вызвать `formControl.dispose()` для отписки. |
| `validators`| набор валидаторов. |
| `callbackValidValue` | callback функция в которое передается последние валидное значение. Она вызывается каждый раз, когда изменилось значение в FormControl и это значение проходит описанные валидации. |
| `activate` | функция позволят включать/отключать валидаций по условию (по умолчанию включено всегда). Например, валидность даты окончания услуги не нужно проверять, если не стоит галочка «Безлимитный». Как следствие, просто вписав сюда функцию которая проверив состояния observable поля отвечающего за чекбокс «Безлимитный», можно автоматически отключить все валидации привязанные к полю на проверку даты, а не прописывать эту логику в каждую из валидаций поля дата. |
| `additionalData` | блок с дополнительной информацией позволяет добавить дополнительную информацию к конкретному `FormControl` и использовать их в дальнейшем, например для визуализации. Это удобно, если есть билдеры для `FormControl` в которых нужно захаркодить определённую информацию, а не передавать это информацию через сложную связку данных в контролы для визуализации. Хотя точного и неоспоримого сценария применения я не смогу привести, но лучше иметь такую возможность, чем страдать без нее. |

Есть одно ограничение, которое также присутствует и FormControl от Angular, не нужно переиспользовать объекты на разных формах. Т.е. можно создать билдер `FormGroup` и на каждую страницу создавать собственный объект. Но использовать один объект на кучу страниц - плохая практика.
Более того `FormControl` инициализируется одним значением, и если это значение будет изменено, новое значение не попадет в `FormControl`. Сделано это специально, ибо, как показала практика, почему-то, все упорно пытаются изначально править исходный объект в обход валидаций, а не значение в `FormControl`. Просто присвоите новое значение полю `value` `FormControl` чтобы изменить исходный объект.
`FormGroup` принимает следующий набор параметров в конструктор:

| Имя | Описание |
| ------ | ------ |
| `controls` | объект унаследованный от `AbstractControls`. По факту просто создаете interface унаследованный от `AbstractControls` в котором перечисляете поля типа `FormGroup`, `FormControl`, | `FormArray`. Можно конечно задать тип any, но тогда потеряется все преимущества TypeSсript-а |
| `validators` | набор валидаторов для групповых значений. Например, можно создать `FormGroup` содержащий в себе два значения - минимальную и максимально дату, для контролла выбора периода. Именно в эти валидаторы нужно будет передать функцию/функции проверки диапазона дат. Например, что дата начала не больше дата конца |
| `activate` | функция позволят включать/отключать валидаций по условию (по умолчанию включено всегда). Надо понимать, что применение функции валидации к группе отключает проверку на уровне всей группы. Например, у нас есть выпадашка выбора документа удостоверяющего личность. Можно создать несколько `FormGroup` с разным набором полей для документов: паспорт, водительское удостоверение, паспорт моряка и т.д.. В этой функции проверять значения выпадашки, и если выбранное значение не соответствует данной группе то отключаются все валидационные проверки. Точнее сказать – группа будет считаться валидной, в независимости от значений в ней. |

Давайте поговорим о полях `FormControl`, в том числе они присутствую и `FormGroup`, и в `FormArray`.

| Имя | Описание |
| ------ | ------ |
| `ControlTypes` | тип контрола (Control, Group, Array) |
| `processing` | в процессе анализа. Т.к. поддерживаются асинхронные валидации, нарпимер те, что требуют запроса на сервер. Текущее состояние проверки можно узнать по данному полю. |

Кроме этого `FormGroup` и `FormArray` поддерживают метод `wait`, который позволяет дождаться окончания проверки. Например при нажатии на кнопку «отправить данные» нужно прописать следующую конструкцию.
```sh
await this.form.wait();
	if (this.form.invalid) {
	…
```
| Имя | Описание |
| ------ | ------ |
| `disabled` | проверка ошибок отключена (контрол всегда валиден) |
| `active` | проверка ошибок включена. Зависит от результата выполнения функции активации. Данное значение очень удобно использовать для скрытия группы полей на форме и не писать дополнительные и дублирующие функции бизнес логики. |
| `invalid` | для `FormControl` – означает, что поле содержит валидационные ошибки. Для `FormGroup` и `FormArray` означает, либо сам групповой контрол содержит ошибки, либо одно из вложенных полей (на любом из уровней вложенности) содержит ошибки валидации. Т.е. для проверки валидности всей формы достаточно выполнить одну проверку invalid или valid верхнего FormGroup. |
| `valid` | для `FormControl` – означает, что поле не содержит валидационные ошибки. Для FormGroup и FormArray означает, либо сам групповой контрол не содержит ошибки, и ни одно из вложенных полей (на любом из уровней вложенности) не содержит ошибки валидации. |
| `pristine` | значение в поле, после инициализации дефолтным значением, не изменялось. |
| `dirty` | значение в поле, после инициализации дефолтным значением, менялось. |
| `untouched` | для `FormControl` – означает, что поле (например input) не было в фокусе. Для FormGroup и FormArray означает, что ни один из вложенных FormControl-ов не был в фокусе. Значение false в этом поле означает, что фокус был не только был поставлен, но и снят с поля. |
| `touched` | для `FormControl` – означает, что поле (например input) было в фокусе. Для `FormGroup` и `FormArray` означает, что один из вложенных `FormControl`-ов был в фокусе. Значение true в этом поле означает, что фокус был не только был поставлен, но и снят с поля. |
| `focused` | для `FormControl` – означает, что поле (например input) сейчас в фокусе. Для `FormGroup` и `FormArray` означает, что один из вложенных `FormControl`-ов сейчас в фокусе. |
| `errors` | поле содержит ошибки валидации. В отличии от перечисленных полей, данный массив содержит именно ошибки либо `FormControl`, либо `FormGroup`, либо `FormArray`, т.е. ошибки данного контрола, а не все вложенные. Влияет на поле valid / invalid |
| `warnings` | поле содержит сообщения "Внимание".  В отличии от перечисленных полей, данный массив содержит именно ошибки либо FormControl, либо FormGroup, либо FormArray, т.е. сообщения данного контрола, а не все вложенные. Не влияет на поле valid / invalid |
| `informationMessages` | поле содержит сообщения "информационные сообщения".  В отличии от перечисленных полей, данный массив содержит именно ошибки либо FormControl, либо FormGroup, либо FormArray, т.е. сообщения данного контрола, а не все вложенные. Не влияет на поле valid / invalid |
| `successes` | поле содержит дополнительные сообщения о валидности.  В отличии от перечисленных полей, данный массив содержит именно ошибки либо FormControl, либо FormGroup, либо FormArray, т.е. сообщения данного контрола, а не все вложенные. Не влияет на поле valid / invalid |
| `maxEventLevel()` | максимальный уровень валидационных сообщении содержащих в поле в текущий момент. Метод вернет одно из значений enum, в следящем приоритете.  - ValidationEventTypes.Error; - ValidationEventTypes.Warning;  - ValidationEventTypes.Info; - ValidationEventTypes.Success; |
| `serverErrors` | после отправки сообщения на сервер, хорошим тоном является проверка валидности формы и на сервере. Как следствие сервер может вернуть ошибки финальной проверки формы, и именно для таких этих ошибок предназначается массив `serverErrors`. Ключевой особенность `serverErrors` – является автоматическая очистка валидационных сообщений при потере фокуса с поля к которому были присвоены серверные ошибки, а также очистка серверных ошибок осуществляется если поле было изменено. |
| onChange | кроме стандартного механизма mobx - reaction можно использовать delegate и добавить к нему callback функцию, которая вызовется при изменении данных. |
| `setDirty(dirty: boolean)` | метод позволят изменить значение полей `pristine` / `dirty` |
| `setTouched(touched: boolean)` | метод позволят изменить значение полей `untouched` / `touched` |
| `dispose()` | обязателен к вызову в componentWillUnmount контрола отвечающего за страницу. |

Это были общие поля для всех контролов, но каждый контрол также имеет и уникальные для свое типа поля.
`FormControl`.

| Имя | Описание |
| ------ | ------ |
| `value` | содержит текущее значение поля. Также данному полю можно присвоить новое значение. |

`FormGroup` и `FormArray` содержат 

| Имя | Описание |
| ------ | ------ |
| `wait()` | метод позволяет ожидать окончания проверок всех (валидаций) в том числе и вложенных |
| `allControls`() | данный метод позволяет получить полный набор всех FormControl в том числе и вложенных на разных уровнях. Т.е. по факту он разворачивает многоуровневый объект FormGroup, который также может содержать в себе FormGroup, в один большой список состоящий только из FormControl. | 

Функцонал `allControls` потребуется, если мы хотим найти первый невалидный элемент и поставить на него фокус.
код, в таком случае будет выглядеть так:
```sh
await this.form.wait();
    if (this.form.invalid) {
      this.form.setTouched(true);
      const firstError = this.form.allControls().find(c => c.invalid && !!c.element);
      if (!!firstError) {
        firstError.element.focus();
      }
    }
...
```

### Валидации <a name="validation_rus">
Конечно, кроме контролов, которые позволяют работать с данными, нам потребуется сами валидации. Пакет `@quantumart/mobx-form-validation-kit` естественно содержит ряд предустановленных валидаций, а также поддерживает создание собственный кастомных валидаций.
Пример задания валидаций для `FormControl` для поля с указанием возраста.
```sh
new FormControl<number>(
        this.userInfo.age,
        [required(), minValue(18, "Вам должно быть больше 18 лет.", ValidationEventTypes.Warning)],
        v => (this.userInfo.age = v)
      )
```
Каждая валидация последними параметрами принимает:

| Имя | Описание |
| ------ | ------ |
| Message | валидационное сообщение. |
| eventType | уровень сообщения. Поддерживается 4 уровня сообщений. |

  - Error - ошибки
  - Warning - предупреждения
  - Info – информационные сообщения
  - Success – сообщения о валидности. Например, можно проверить, что пароль действительно сложный. 

В пакете идет следующий набор валидаций:

| Имя | Описание |
| ------ | ------ |
| `required`(… | обязательное поле |
| `notEmptyOrSpaces`(… | поле не пустое и не содержит одни пробелы. По факту required с учетом запрета пробелов. |
| `pattern`(regExp: RegExp, … | первым параметром идет регулярное выражение, которому должно соответствовать поле. Ошибка выдается, если нет соответствия паттерну. |
| `invertPattern`(regExp: RegExp, … | первым параметром идет регулярное выражение, которому не должно соответствовать поле. Ошибка выдается, если есть соответствия паттерну. |
| `minLength`(minlength: number, …. | первым параметром идет минимальная длина текста включительно. Ошибка выдается если длина меньше переданной. |
| `maxLength`(maxlength: number, …. | первым параметром идет максимальная длина текста включительно. Ошибка выдается если длина больше переданной. |
| `absoluteLength`(length: number, …. | первым параметром идет точная длина текста. Ошибка выдается если длина не соответствует заданной. |
| `minValue`(min: TEntity  (() => TEntity) , …. | данная валидация предназначена только для чисел и дат. Ошибка устанавливается, если значение меньше указанного. Особенность валидации является возможность принимать в качестве первого параметра не только конкретное значение, но и функцию. Что означает, что если считывать значение в этой функции с @observable поля объекта, валидация сама будет перезапускаться не только при изменении поля на которое повешена валидация, но и также и при изменении «связанно поля». При этом не требуется никаких дополнительных манипуляций кроме как пометить поле с которого считывается значение как @observable. |
| `maxValue`(max: TEntity  (() => TEntity) , …. | данная валидация предназначена только для чисел и дат. Ошибка устанавливается, если значение больше указанного. Особенность валидации является возможность принимать в качестве первого параметра не только конкретное значение, но и функцию. Что означает, что если считывать значение в этой функции с @observable поля объекта, валидация сама будет перезапускаться не только при изменении поля на которое повешена валидация, но и также и при изменении «связанно поля». При этом не требуется никаких дополнительных манипуляций кроме как пометить поле с которого считывается значение как @observable |
| `notContainSpaces`(… | в отличии от notEmptyOrSpaces, ошибка будет выдаваться если в значении вообще будет хоть один пробел. |
| `compare`(expression: (value: TEntity) => boolean(… | написание собственной функции-валидации порождает много копипастного кода, для избавления этой проблемы была разработана эта обертка. Эта валидационная функция первым параметром принимает функцию, в которую в свою очередь передается текущее значение поля. Что позволяет сделать сложную проверку. Например, расчет хеша для ИНН или номера паспорта. И после вернуть true/false. Ошибка будет отображена, если проверка вернула false. |
| `isEqual`(value: string… | простая проверка на соответствие строке. |

Далее описаны функции обертки, которые служат для управления потоком запуска валидаций. 
Нужно отметить, что переданный в `FormControl`, `FormGroup`, `FormArray` набор валидаций запускается единым скопом и по факту не имеет последовательности выполнения. Итогом работы мы будем иметь в полях errors, warnings, informationMessages, successes массивы состоявшие из объеденных в единый массив ошибок, предупреждений и т.д..  
Часто заказчик хочет увидеть лишь одну ошибку, а не все сразу. Более того, ТЗ может быть составлено так, что одна проверка выполняется только после того как прошла предыдущая.
Для решения данной проблемы применяется обертка `wrapperSequentialCheck`. Ей вызов и её применение не чем не отличается от обычной функции-валидатора, но на вход она принимает массив из валидаторов которые будет запускается последовательно, т.е. следующая валидация запуститься только после того, что предыдущая прошла без ошибок.
Второй функций оберткой является функция управления потоком валидаций. `wrapperActivateValidation` первым параметром принимает функцию в которой нужно прописать условия активаций валидаций. В отличии от функции activate которая передается в FormControl данная проверка рассчитана на более сложную логику. Предположим, что у нас общий билдер для целой формы `FormGroup` платежей, и более того на сервере есть только один метод который и принимает общий набор полей. Но вот загвоздка в том, что хоть форма и одна, в зависимости от «типа платежа» мы показываем различный набор полей пользователю. Так вот `wrapperActivateValidation` позволяет написать логику при которой будет осуществляться различные проверки в зависимости от типа платежа.
Выглядеть применение оберток будет точно также, как и обычных функций.
```sh
new FormControl(
        this.userInfo.megapole,
        [wrapperActivateValidation(() => this.info.A === 10, [
                required(),
                pattern(/\^d{10}$/)
        ]),
        wrapperActivateValidation(() => this.info.A === 20, [
                wrapperSequentialCheck([
                        notContainSpaces(),
                        pattern(/\^d{20}$/)
                ])
        ])],
        v => (this.userInfo.megapole = v)
      )

```
Из данного примера видно, что проверки required(), pattern(/\^d{10}$/) будут осуществляться только при this.info.A === 10, а в случае если this.info.A === 20, то сработают валидации notContainSpaces(), pattern(/\^d{20}$/), кроме того эти валидации сработают последовательно, в отличии от первого случая.

Естественно, наступит момент когда стандартного набора валидаций уже не будет хватать.
Тогда придется писать собственные асинхронные функции. Благо это делается без особых сложностей.
`FormControl` изначально затачивался на асихронные валидационые функции, которым может захотеться сходить на сервер на данными и этот ответ нужно ждать. А как следствие все валидации являются асинхронными. 
```sh
async function checkValueOnServer(control: FormControl): Promise<ValidationEvent[]> {
    if (control.value == null) {
      return [];
    }
    const result = await sendToServer(control.value);
    if (result.errorMessage) {
      return [
        {
          message: result.errorMessage,
          type: ValidationEventTypes.Error,
        },
      ];
    }
    return [];
}
```
Тут нужно обратить внимание на два объекта.
Первый мы всегда возражающем массив. Т.е. по факту можно вернуть сразу несколько ошибочных сообщений, если вам будет угодно.
Второй момент это возвращаемый объект, он имеет следующий набор полей.

| Имя | Описание |
| ------ | ------ |
| `key` | необязательное поле, позволяет задать "ключ" для конкретной валидаций. У всех базовых key уникален и совпадает с их именем. Может возникнуть желание, использовать key для рендернга списка в react, но как показала практика это плохая идея. В дальнейшем, в примере, я покажу, что лучше использовать message, а key вообще не трогать. В любом случае он есть, как и в Angunar, но вот его необходимость сведена, по факту, к 0.|
| `message` | валидационное сообщение. Обязательное поле. |
| `type` | тип сообщения.  - Error - ошибки  - Warning - предупреждения  - Info – информационные сообщения  - Success – сообщения о валидности. Например, можно проверить, что пароль действительно сложный. |
| `additionalData` | дополнительная информация которую можно передать вместе с валидацией, если это необходимо. Это может быть какая-то дополнительная html разметка или специфичный стиль. В общем-то в any можно засунуть всё. |

### Extensions<a name="extensions_rus">
Любая магия основывается на тривиальных вещах. И в этом случае, для работы постановки фокуса, получение изменений с полей требуется связать `FormControl` в конкретным полем ввода.
Т.к. `FormControl` не ограничивает разработчика в типе валидируемых данных, то из-за универсальности пришлось немного пожертвовать применимостью в react элементам. 
При этом, для input и textarea удалось создать простые функции биндинга данных на элемент, для остальных компонентов, обработчику придется все же приложить минимальные усилия для подстановки данных. 

Для input биндинг элемента на `FormControl` (name) будет выглядеть так. 
`<input type="text" {...InputFormControl.bindActions(controls.name)} />`
Для textarea биндинг будет таким
`<textarea {...TextAreaFormControl.bindActions(controls.name)}/>`

`InputFormControl.bindActions` и `TextAreaFormControl.bindActions` принимаю два параметра:

| Имя | Описание |
| ------ | ------ |
| `formControl` | собственно FormControl на который будет приходиться биндинг. Обязательный параметр. |
| `events` | Необязательный параметр,  содержащий список функций, которые можно вызвать в случае необходимости их кастомизации. Суть в том, что `bindActions` навешивает функции-обработчики событий на Element, а как следствие, перекрытие этих событий в element приведет к неработоспособности либо `FormControl`-а, либо функции разработчика. Для решения этой проблемы. Мы передаем нужную кастомную функцию разработка в объект event. Сейас поддерживается следующий набор методов.  - ref  - onChange  - onBlur  - onFocus |

При использовании библиотеки вы сможете заменить, что наиболее частым вариантом создания `FormControl`-ов является следующая конструкция.
```sh
this.form = new FormGroup<IUserInfo>({
      name: new FormControl(
        this.userInfo.name,
        [],
        v => (this.userInfo.name = v)
      )
    });
```
Наибольшей проблемой здесь является двойное упоминание this.userInfo.name, для изначально инициализации `FormControl` и для записи результата. Такая связка может породить нежелательные проблемы во время копипаста и для их решения была разработана функция `FormControl.for` 
```sh
this.form = new FormGroup<IUserInfo>({
      name: FormControl.for(this.userInfo, 'name', [])
    });
```
Как можно видеть, теперь не требуется повторять обращение к полю name name два раза. Причем, благодаря возможностям типизации в TypeScript, строка name, действительно отслеживается как поле. И если такого поля не будет в объекте userInfo - мы получим ошибку компиляции.

Если вы дочитали досюда - вы уже герой. :)

### Пример<a name="example_rus">
Демонстрацию будем проводить на React проекте на TypeScript с использованием mobx.
Для существующего проекта мы просто добавляем пакет.
```sh
npm install @quantumart/mobx-form-validation-kit
```

Компонент Hello в страницу регистрации. Для этого создадим класс RegistrationStore в новом файле RegistrationStore.ts
src\RegistrationStore.ts
```sh
import { observable } from "mobx";

export class RegistrationStore {
  @observable
  public userInfo = {
    name: "Виталий"
  };
}

export const registrationStore = new RegistrationStore();

```
Файл Hello.ts, модифицируем так.
```sh
import * as React from "react";
import { observer } from "mobx-react";
import { registrationStore } from "../RegistrationStore";

@observer
export class Hello extends React.Component {
  private changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    registrationStore.userInfo.name = event.target.value;
  };
  render() {
    return (
      <React.Fragment>
        <h1>Здравствуйте, {registrationStore.userInfo.name}</h1>
        <div className="row">
          <span>Имя:</span>
          <input
            type="text"
            value={registrationStore.userInfo.name}
            onChange={this.changeName}
          />
        </div>
      </React.Fragment>
    );
  }
}

```
В итоге получился уже функциональный компонент, со Store работающим через Mobx. Можно уже увидеть результат работы в виде динамически меняющихся текстов на странице при вводе информации в input.
Но во всей этой красоте, есть проблема. Чем больше полей у нас добавляется, тем больше методов изменений нам придется написать. А после добавления кнопки «отправить» нужно будет не забыть проверить все поля с учетом их с видимости. И с каждым новым полем количество копипаста будет только увеличиваться, не говоря уже про сложное переиспользование кода.
Для решения этой кучи проблем была создана
`@quantumart/mobx-form-validation-kit`

Для начала создадим небольшой компонент-обертку для визуализации ошибок.
stc/ErrorWraper.tsx
```sh
import * as React from "react";
import { observer } from "mobx-react";
import { FormControl } from "@quantumart/mobx-form-validation-kit";

interface Props {
  formControl: FormControl;
}

@observer
export class ErrorWraper extends React.Component<Props> {
  render() {
    return (
      <div>
        {this.props.children}
        {this.props.formControl.errors.map(error => (
          <span key={error.message} className="error">
            {error.message}
          </span>
        ))}
      </div>
    );
  }
}
```
В нем нет ничего сложного, просто выводим красный текст сообщений-ошибок, если они есть.

Компонент Hello.tsx модифицируется тоже не сильно. 
Во-первых - убирается лишний метод changeName. Вместо него добавилась строка биндинга `{...InputFormControl.bindActions(controls.name)}`. В ней содержится все необходимые методы которые позволят реагировать на изменения данных.
Во-вторых – мы добавили обертку для input, конечно лучше сделать отдельный компонент с input внутри, но тогда, для пояснений, потребуется немного более сложна структура.
В-третьих – в конструктор добавлена функция которая инициализирует form в store, а, самое главное, в `componentWillUnmount` прописали `registrationStore.form.dispose()`. Без это вызова могут mobx реакции которые развешивает `FromControl` могут так и остаться жить до самой перезагрузки страницы.
```sh
import * as React from "react";
import { observer } from "mobx-react";
import { registrationStore } from "../RegistrationStore";
import { ErrorWraper } from "../ErrorWraper";
import { InputFormControl } from "@quantumart/mobx-form-validation-kit";

@observer
export class Hello extends React.Component {
  constructor(props: any) {
    super(props);
    registrationStore.initForm();
  }
  componentWillUnmount() {
    registrationStore.form.dispose();
  }
  render() {
    const controls = registrationStore.form.controls;
    return (
      <React.Fragment>
        <h1>Здравствуйте, {registrationStore.userInfo.name}</h1>
        <div className="row">
          <span>Имя:</span>
          <ErrorWraper formControl={controls.name}>
            <input
              type="text"
              {...InputFormControl.bindActions(controls.name)}
            />
          </ErrorWraper>
        </div>
      </React.Fragment>
    );
  }
}

```
Дополнительным изменения подвергся и файл RegistrationStore.ts.
Он приобрёл следующую структуру. 
Основным объектом (исходным объектом) с информацией о пользователе остался userInfo, но кроме этого появилась прослойка в виде form. Именно эта прослойка будет отвечать за валидации и за-за присвоения данных объекту userInfo.
```sh
import { observable } from "mobx";
import {
  FormControl,
  FormGroup,
  AbstractControls
} from "@quantumart/mobx-form-validation-kit";

interface IUserInfo extends AbstractControls {
  name: FormControl;
}

export class RegistrationStore {
  @observable
  public userInfo = {
    name: "Виталий"
  };

  @observable
  public form: FormGroup<IUserInfo>;

 public initForm(): void {
    this.form = new FormGroup<IUserInfo>({
      name: new FormControl(
        this.userInfo.name,
        [],
        v => (this.userInfo.name = v)
      )
    });
  }
}
export const registrationStore = new RegistrationStore();
```

### Об авторе<a name="about_rus">
Пакет разработан в компании [Quantum Art](http://www.quantumart.ru)  одним из лидеров рынка разработки технологически сложных интернет/интранет решений.

- Виталий Алферов - ведущий разработчик пакета.
- Дмитрий Панюшкин - доработка и раширение функционала.
- Илья Стукалов - редактор.
