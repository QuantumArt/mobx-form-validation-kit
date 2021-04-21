# mobx-form-validation-kit

[![Version](https://img.shields.io/npm/v/@quantumart/mobx-form-validation-kit?style=flat)](https://www.npmjs.com/package/@quantumart/mobx-form-validation-kit)
![CI Workflow](https://github.com/QuantumArt/mobx-form-validation-kit/actions/workflows/ci.yml/badge.svg?branch=master)
[![License](https://img.shields.io/npm/l/@quantumart/mobx-form-validation-kit.svg?style=flat)](https://www.npmjs.com/package/@quantumart/mobx-form-validation-kit)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://www.npmjs.com/package/@quantumart/mobx-form-validation-kit)

- [Документация для 1 версии / Docs for version 1](docs/docs-v1.md#form_control1)

### Плюсы пакета<a name="pluses_rus">
  - Полностью на TypeScript
  - Совместимость с Mobx ( mobx-form-validation-kit ^1.0.0 | ^2.0.0 совместим с версиями mobx ^4.0.0 | ^5.0.0 ) ( mobx-form-validation-kit ^6.0.0 mobx совместим с ^6.0.0 )
  - Рассчитан на работу в React (можно использовать в проектах и без react)
  - Рассчитан на асинхронные валидации
  - Легко встроить в существующий проект.

Версия для [Flutter](https://pub.dev/packages/flutter_mobx_form_validation_kit)

- [Getting Started](#get_started2)
- [Состояние контрола](#state_control_rus2)
- [Валидация](#validation_rus2)
- [Проверка перед отправкой](#submit_rus2)
- [Заключение](#final_rus2)

### Getting Started<a name="get_started2">
Библиотеку можно применять при разных подходах к структуре кода, но я буду рассматривать библиотеку в концепции MVC (Model-View-Controller).
Т.е. отображение происходит через «глупые» компоненты, а бизнес логика (в том числе и валидация) зашита в Stor-ах.
Компоненты будут строятся на react-хуках, просто по причине, что он более современный, но библиотека хорошо работает и в «классовом подходе».

```
interface FormRegistration extends ControlsCollection {
  name: FormControl<string>;
}
export class RegistrationStore {
  public form: FormGroup<FormRegistration>;

  constructor() {
    this.form = new FormGroup<FormRegistration>({
      name: new FormControl<string>("", {
        validators: [requiredValidator()],
      }),
    });
  }
}

const store = new RegistrationStore();
export function RegistrationComponent() {
  return useObserver(() => (
    <div>
      <p>{store.form.controls.name.value}</p>
      <input
        type="text"
        value={store.form.controls.name.value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          store.form.controls.name.value = event.target.value;
        }}
      />
      ...{store.form.controls.name.errors.map((error) => (
        <p style={{ color: "#FFF" }}>{error.message}</p>
      ))}
    </div>
  ));
}
```

Если начать что-то вводить, то ошибка тут же пропадет.
Но естественный и привычный нам формат отображения ошибки валидации подразумевает отображение этой самой ошибки или после ввода символа, либо после того как фокус у поля будет потерян. mobx-form-validation-kit имеется весь необходимый набор для этого.

| Имя | Описание |
| ------ | ------ |
| `pristine: boolean` | значение в FormControl, после инициализации дефолтным значением, не изменялось. |
| `dirty: boolean` | значение в FormControl, после инициализации дефолтным значением, менялось. |
| `untouched: boolean` | для FormControl – означает, что поле не было в фокусе. Для FormGroup и FormArray означает, что ни один из вложенных FormControl-ов не был в фокусе. Значение false в этом поле означает, что фокус был не только был поставлен, но и снят с поля. |
| `touched: boolean` | Для FormControl – означает, что поле было в фокусе. Для FormGroup и FormArray означает, что один из вложенных FormControl-ов был в фокусе. Значение true в этом поле означает, что фокус был не только был поставлен, но и снят с поля. |
| `focused: boolean` | для FormControl – означает, что поле сейчас в фокусе. Для FormGroup и FormArray означает, что один из вложенных FormControl-ов сейчас в фокусе. |

```
<input
        type="text"
        value={store.form.controls.name.value}
        ref={(elment) => (props.control.element = elment)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          store.form.controls.name.value = event.target.value;
        }}
        onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
          store.form.controls.name.setTouched(true);
          store.form.controls.name.setFocused(false);
        }}
        onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
          store.form.controls.name.setFocused(true);
        }}
      />
      {store.form.controls.name.touched &&
        store.form.controls.name.errors.map((error) => (
          <p style={{ color: "#F00" }}>{error.message}</p>
        ))}
```

Как мы видим, появилось большое количество кода, а именно методы
• ref
•	onChange
•	onBlur
•	onFocus

Можно воспользоваться небольшой оберткой, а именно InputFormControl или TextAreaFormControl.
```
<input
        type="text"
        value={store.form.controls.name.value}
        {...InputFormControl.bindActions(store.form.controls.name)}
      />
```

В данном случае мы отображаем ошибку после того как поле «потрогали» (т.е. оно потеряло фокус в первый раз).

### Состояние контрола<a name="state_control_rus2">

Разберем структуру вложенности контроллеров и их возможности.
Библиотека mobx-form-validation-kit имеет три основных типа узлов:
| Имя | Описание |
| ------ | ------ |
| `FormGroup` | позволяет объединять валидационные компоненты вместе. Класс типизированный, и позволяет передать в качестве generic параметра интерфейс со списком полей. |
| `FormControl` | используется для валидации конкретного поля, наиболее часто используемый класс. Класс типизированный, и в качестве generic параметра принимает тип переменной которую должен хранить. |
| `FormArray` | позволяет создавать и управлять массивом валидационных компонентов. |

Сами узлы можно складывать в древовидном стиле. Поддерживается любой уровень вложенности, но обычно все начинается в FormGroup.
```
FormGroup
-- FormControl
-- FormControl
-- -- FormGroup
-- -- FormArray
-- -- -- FormGroup
-- -- --  -- FormControl
-- -- FormArray
-- -- --  FormControl
```

Каждый объект класса поддерживает следующий набор опций при определении:
| Имя | Описание |
| ------ | ------ |
| `validators: ValidatorsFunction[]` | набор валидаторов. |
| `activate: (() => boolean)` | функция позволят включать/отключать валидации по условию (по умолчанию включено всегда). Например, валидность даты окончания услуги не нужно проверять, если не стоит галочка «Безлимитный». Как следствие, просто вписав сюда функцию которая проверив состояние observable поля отвечающего за чекбокс «Безлимитный», можно автоматически отключить все валидации привязанные к полю на проверку даты, а не прописывать эту логику в каждую из валидаций поля дата. |
| `additionalData: any` | блок с дополнительной информацией который позволяет добавить дополнительную информацию к конкретному FormControl и использовать их в дальнейшем, например, для визуализации. Это удобно, если есть билдеры для FormControl в которых нужно захаркодить определённую информацию, а не передавать эту информацию через сложную связку данных в контролы для визуализации. Хотя точного и неоспоримого сценария применения для additionalData мы так и не смогли найти, но лучше иметь такую возможность, чем страдать без нее. |

Кроме этого для FormControl есть дополнительный набор опций:
| Имя | Описание |
| ------ | ------ |
| `onChangeValue: UpdateValidValueHandler<TEntity>` | срабатывает всегда при изменении значения |
| `onChangeValidValue: UpdateValidValueHandler<TEntity>` | передает последнее валидное значение |
| `callSetterOnInitialize</b>: boolean` | позволяет вызвать 'onChangeValidValue' при создании `FormControl` |
| `callSetterOnReinitialize: boolean` | позволяет вызывать `onChangeValidValue` при каждом изменении результата функции-геттера из первого аргумента |

Каждый элемент дерева поддерживает следующий набор полей
| Имя | Описание |
| ------ | ------ |
| `processing: boolean` |	в процессе анализа. mobx-form-validation-kit поддерживает асинхронные валидации, например те, что требуют запроса на сервер. Текущее состояние проверки можно узнать по данному полю.
Кроме этого поддерживается метод wait, который позволяет дождаться окончания проверки. Например, при нажатии на кнопку «отправить данные» нужно прописать следующую конструкцию.
```
await this.form.wait();
if (this.form.invalid) {
...
```

| Имя | Описание |
| ------ | ------ |
| `disabled: boolean` |	проверка ошибок отключена (контрол всегда валиден) |
| `active: boolean` |	проверка ошибок включена. Зависит от результата выполнения функции активации. Данное значение очень удобно использовать для скрытия группы полей на форме и не писать дополнительные и дублирующие функции бизнес логики. |
| `invalid: boolean` | для FormControl – означает, что поле содержит валидационные ошибки. Для FormGroup и FormArray означает, либо сам групповой контрол содержит ошибки, либо одно из вложенных полей (на любом из уровней вложенности) содержит ошибки валидации. Т.е. для проверки валидности всей формы достаточно выполнить одну проверку invalid или valid верхнего FormGroup. |
| `valid: boolean` | для FormControl – означает, что поле не содержит валидационные ошибки. Для FormGroup и FormArray означает, либо сам групповой контрол не содержит ошибки, и ни одно из вложенных полей (на любом из уровней вложенности) не содержит ошибки валидации. |
| `pristine: boolean` | значение в поле, после инициализации дефолтным значением, не изменялось. |
| `dirty: boolean` |  значение в поле, после инициализации дефолтным значением, менялось. |
| `untouched: boolean` |	для FormControl – означает, что поле (например input) не было в фокусе. Для FormGroup и FormArray означает, что ни один из вложенных FormControl-ов не был в фокусе. Значение false в этом поле означает, что фокус был не только был поставлен, но и снят с поля. |
| `touched: boolean` |	Для FormControl – означает, что поле (например input) было в фокусе. Для FormGroup и FormArray означает, что один из вложенных FormControl-ов был в фокусе. Значение true в этом поле означает, что фокус был не только был поставлен, но и снят с поля. |
| `focused: boolean` |	для FormControl – означает, что поле (например input) сейчас в фокусе. Для FormGroup и FormArray означает, что один из вложенных FormControl-ов сейчас в фокусе. |
| `errors: ValidationEvent[]` |	поле содержит ошибки валидации. В отличии от перечисленных полей, данный массив содержит именно ошибки либо FormControl, либо FormGroup, либо FormArray, т.е. ошибки данного контрола, а не все вложенные. Влияет на поле valid / invalid |
| `warnings: ValidationEvent[]` |	поле содержит сообщения «Внимание». В отличии от перечисленных полей, данный массив содержит именно ошибки либо FormControl, либо FormGroup, либо FormArray, т.е. сообщения данного контрола, а не все вложенные. Не влияет на поле valid / invalid |
| `informationMessages: ValidationEvent[]` |	поле содержит сообщения «информационные сообщения». В отличии от перечисленных полей, данный массив содержит именно ошибки либо FormControl, либо FormGroup, либо FormArray, т.е. сообщения данного контрола, а не все вложенные. Не влияет на поле valid / invalid |
| `successes: ValidationEvent` |	поле содержит дополнительные сообщения о валидности. В отличии от перечисленных полей, данный массив содержит именно ошибки либо FormControl, либо FormGroup, либо FormArray, т.е. сообщения данного контрола, а не все вложенные. Не влияет на поле valid / invalid |
| `maxEventLevel()` |	максимальный уровень валидационных сообщении содержащих в поле в текущий момент. |
Метод вернет одно из значений enum, в следящем приоритете.
        1.	ValidationEventTypes.Error;
        2.	ValidationEventTypes.Warning;
        3.	ValidationEventTypes.Info;
        4.	ValidationEventTypes.Success;

| Имя | Описание |
| ------ | ------ |
| `serverErrors: string[]` |	после отправки сообщения на сервер, хорошим тоном является проверка валидности формы и на сервере. Как следствие сервер может вернуть ошибки финальной проверки формы, и именно для таких этих ошибок предназначается массив serverErrors. Ключевой особенностью serverErrors – является автоматическая очистка валидационных сообщений при потере фокуса с поля к которому были присвоены серверные ошибки, а также очистка серверных ошибок осуществляется если поле было изменено. |
| `setDirty(dirty: boolean)` |	метод позволят изменить значение полей pristine / dirty |
| `setTouched(touched: boolean)` |	метод позволят изменить значение полей untouched / touched |
| `setFocused()` |	метод позволят изменить значение поля focused (доступно только для FormControl) |
| `dispose()` |	обязателен к вызову в componentWillUnmount контрола отвечающего за страницу. |

Примечание.
Поля valid и invalid в FormGroup и FormArray ориентируется на вложенные элементы.
И проверив самый верхний можно узнать валидность всех нижестоящих элементов формы.
НО! Узлы FormGroup и FormArray имеют `cвой` набор валидаций и список ошибок (errors, warnings, informationMessages, successes). Т.е. если спросить у FormGroup errors – она выдаст только свои ошибки, но не ошибки на вложенном FormControl.

### Валидация<a name="validation_rus2">

Библиотека mobx-form-validation-kit позволяет писать пользовательские валидации, но в ней присутствует и собственный набор.
| Имя | Описание |
| ------ | ------ |
| `requiredValidator` |	проверяет, что значение не равно null, а для строк проверяет строку на пустоту. |
| `notEmptyOrSpacesValidator` | проверяет, что значение не равно null, а для строк проверяет строку на пустоту или что она не состоит из одних пробелов. |
| `notContainSpacesValidator` | проверяет, что строка не содержит пробелов. |
| `patternValidator` | выдает ошибку, если нет соответствия паттерну |
| `invertPatternValidator` | выдает ошибку, если есть соответствие паттерну |
| `minLengthValidator` | проверяет строку на длину минимальную  |
| `maxLengthValidator` | проверяет строку на максимальную длину |
| `absoluteLengthValidator` | проверяет строку на конкретную длину |
| `isEqualValidator` | проверяет на точное значение |
| `compareValidator` |обёртка для сложной проверки (ошибка, если проверка вернула false) |

```
  firstName: new FormControl<string>("", {
    validators: [
      requiredValidator(),
      minLengthValidator(2),
      maxLengthValidator(5),
      notContainSpacesValidator()
    ],
  })
```

Как можно заметить отработали все валидации в списке, для решения данной проблемы применяется обертка <b>wrapperSequentialCheck</b>. Её вызов и её применение ничем не отличается от обычной функции-валидатора, но на вход она принимает массив из валидаторов которые будут запускаться последовательно, т.е. следующая валидация запустится только после того, как предыдущая прошла без ошибок.
Второй функций оберткой является функция управления потоком валидаций. <b>wrapperActivateValidation</b> первым параметром принимает функцию в которой нужно прописать условия активаций валидаций. В отличии от функции activate которая передается в FormControl данная проверка рассчитана на более сложную логику. Предположим, что у нас общий билдер для целой формы FormGroup платежей, и более того на сервере есть только один метод который и принимает общий набор полей. Но вот загвоздка в том, что хоть форма и одна, в зависимости от «типа платежа» мы показываем различный набор полей пользователю. Так вот <b>wrapperActivateValidation</b> позволяет написать логику при которой будут осуществляться различные проверки в зависимости от типа платежа.

```
firstName: new FormControl<string>("", {
        validators: [
          wrapperSequentialCheck([
            requiredValidator(),
            minLengthValidator(2),
            maxLengthValidator(5),
            notContainSpacesValidator(),
          ]),
        ],
      })
```

Пользовательсяка валидация группы.

```
interface FormRange extends ControlsCollection {
  min: FormControl<Date>;
  max: FormControl<Date>;
}

interface FormRegistration extends ControlsCollection {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<string>;
  dateRange: FormGroup<FormRange>;
}
```

```
this.form = new FormGroup<FormRegistration>({
...
      dateRange: new FormGroup<FormRange>(
        {
          min: new FormControl<Date>(new Date()),
          max: new FormControl<Date>(new Date()),
        },
        {
          validators: [
            async (group: FormGroup<FormRange>): Promise<ValidationEvent[]> => {
if (group.controls.max.value < group.controls.min.value) {
                return [
                  {
                    message: 'Дата "от" больше даты "до"',
                    type: ValidationEventTypes.Error,
                  },
                ];
              }
              return [];            },
          ],
        }
      ),
    });
```

Как видно из примера валидация вешается не на конкретное [хотя так тоже можно], а вешается на всю группу целиком. Остается лишь вывести ошибки группы в интерфейсе.

### Проверка перед отправкой<a name="submit_rus2">

```
await this.form.wait();
if (this.form.invalid) {
this.form.setTouched(true);
 const firstError = this.form.allControls().find(c => c.invalid && !!c.element);
if (!!firstError) { firstError.element.focus();
}
```

### Заключение<a name="final_rus2">
Понятное дело, что описанным набор возможности библиотеки не ограничиваются. Еще можно рассказать и показать примеры.
•	Что валидаци отработают не только когда меняется само значение, но и когда поменялась observable переменная внутри валидации.
•	Как работает метод active
•	Что FormControl можно инициализовать не только конкретной переменной, но и функцией которая возвращает значение. И изменения внутри этой функции будут также отслеживаться.
•	Как работать с FormArray
•	Как делать сложную валидацию с запросами на сервер и при этом всё равно переменные в этой валидации будут отслеживаемыми.

И еще кучу всего, что позволяет из коробки пакет mobx-form-validation-kit.

П.с.
Найдете ошибки – пишите, исправим :)

### Об авторе<a name="about_rus">
Пакет разработан в компании [Quantum Art](http://www.quantumart.ru)  одним из лидеров рынка разработки технологически сложных интернет/интранет решений.

- Виталий Алферов - ведущий разработчик пакета.
- Дмитрий Панюшкин - доработка и раширение функционала.
- Илья Стукалов - редактор.
