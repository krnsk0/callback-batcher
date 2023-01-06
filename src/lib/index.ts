import {
  callbackBatcherFactory,
  CallbackBatcherFactoryConfig,
  CallbackBatcherStrategies,
} from './callbackBatcherFactory';
import { CallbackBatcher, ScheduleFn, Disposer } from './types';

export type {
  CallbackBatcher,
  ScheduleFn,
  Disposer,
  CallbackBatcherFactoryConfig,
};

export { callbackBatcherFactory, CallbackBatcherStrategies };
