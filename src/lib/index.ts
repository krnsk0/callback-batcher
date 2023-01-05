import {
  callbackBatcherFactory,
  CallbackBatcherFactoryConfig,
  CallbackBatcherStrategies,
} from './callbackBatcherFactory';
import { CallbackBatcher, ScheduleFn } from './types';

export type { CallbackBatcher, ScheduleFn, CallbackBatcherFactoryConfig };

export { callbackBatcherFactory, CallbackBatcherStrategies };
