import {
  makeCallbackBatcher,
  makeCallbackBatcherConfig,
  CallbackBatcherStrategies,
} from './makeCallbackBatcher';
import { CallbackBatcher, ScheduleFn, Disposer } from './types';

export type {
  CallbackBatcher,
  ScheduleFn,
  Disposer,
  makeCallbackBatcherConfig as CallbackBatcherFactoryConfig,
};

export { makeCallbackBatcher as callbackBatcherFactory, CallbackBatcherStrategies };
