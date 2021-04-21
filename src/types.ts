export enum ControlTypes {
  Control,
  Group,
  Array,
}

export enum ValidationEventTypes {
  Error,
  Warning,
  Info,
  Success,
}

export interface ValidationEvent {
  key?: string;
  message: string;
  type: ValidationEventTypes;
  additionalData?: any;
}
