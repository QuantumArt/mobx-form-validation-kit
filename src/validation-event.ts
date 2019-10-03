import { ValidationEventTypes } from './validation-event-types';

export interface ValidationEvent {
  key?: string;
  message: string;
  type: ValidationEventTypes;
  additionalData?: any;
}
