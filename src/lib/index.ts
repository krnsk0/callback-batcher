import {
  makeCallbackBatcher,
  makeCallbackBatcherConfig,
} from './makeCallbackBatcher';
import { CallbackBatcher, ScheduleFn, Disposer } from './types';

export type {
  CallbackBatcher,
  ScheduleFn,
  Disposer,
  makeCallbackBatcherConfig,
};

export { makeCallbackBatcher };
