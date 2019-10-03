import { FormControl } from './form-control';
import * as React from 'react';

export class InputFormControl {
  public static bindActions(
    formControl: FormControl<string | Date>,
    events?: {
      onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
      onBlur?(event: React.FocusEvent<HTMLInputElement>): void;
      onFocus?(event: React.FocusEvent<HTMLInputElement>): void;
    },
  ) {
    return {
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        formControl.value = event.target.value;
        if (!!events) {
          events.onChange && events.onChange(event);
        }
      },
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        formControl.setTouched(true);
        formControl.setFocused(false);
        if (!!events) {
          events.onBlur && events.onBlur(event);
        }
      },
      onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
        formControl.setFocused(true);
        if (!!events) {
          events.onFocus && events.onFocus(event);
        }
      },
    };
  }
}

export class TextAreaFormControl {
  public static bindActions(
    formControl: FormControl<string | Date>,
    events?: {
      onChange?(event: React.ChangeEvent<HTMLTextAreaElement>): void;
      onBlur?(event: React.FocusEvent<HTMLTextAreaElement>): void;
      onFocus?(event: React.FocusEvent<HTMLTextAreaElement>): void;
    },
  ) {
    return {
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        formControl.value = event.target.value;
        if (!!events) {
          events.onChange && events.onChange(event);
        }
      },
      onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => {
        formControl.setTouched(true);
        formControl.setFocused(false);
        if (!!events) {
          events.onBlur && events.onBlur(event);
        }
      },
      onFocus: (event: React.FocusEvent<HTMLTextAreaElement>) => {
        formControl.setFocused(true);
        if (!!events) {
          events.onFocus && events.onFocus(event);
        }
      },
    };
  }
}
