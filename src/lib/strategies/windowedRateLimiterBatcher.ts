import { BatchedCallback } from '../types';
import CallbackBactcherStrategy from './callbackBatcherStrategy';

/**
 * Configuration for the windowed rate limiter batcher strategy
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WindowedRateLimiterBatcherConfig {
  // TODO
}

/**
 * TODO
 */
export default class WindowedRateLimiterBatcher
  implements CallbackBactcherStrategy
{
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  constructor(config: WindowedRateLimiterBatcherConfig) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy = (): void => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  schedule = (hash: string, callback: BatchedCallback): void => {};
}
