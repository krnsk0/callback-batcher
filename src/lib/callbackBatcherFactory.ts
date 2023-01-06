import CallbackBactcherStrategy from './strategies/callbackBatcherStrategy';
import LeakyBucketBatcher, {
  LeakyBucketBatcherConfig,
} from './strategies/leakyBucketBatcher';
import WindowedRateLimiterBatcher, {
  WindowedRateLimiterBatcherConfig,
} from './strategies/windowedRateLimiterBatcher';
import { CallbackBatcher, ScheduleFn } from './types';

/**
 * Used as the hash when the user declines to pass one in
 */
const DEFAULT_HASH = 'DEFAULT_HASH' as const;

/**
 * This library exposes several strategies for managing the timing of scheduled
 * callbacks corresponding to entries in this enum.
 */
export enum CallbackBatcherStrategies {
  LEAKY_BUCKET = 'LEAKY_BUCKET',
  WINDOWED_RATE_LIMITER = 'WINDOWED_RATE_LIMITER',
}

type DefaultConfig = { strategy?: undefined } & LeakyBucketBatcherConfig;

/**
 * Config values to be passed when using the Leaky Bucket strategy
 */
type LeakyBucketConfig = {
  strategy: CallbackBatcherStrategies.LEAKY_BUCKET;
} & LeakyBucketBatcherConfig;

/**
 * Config values to be passed when using the Windowed Rate Limiter strategy
 */
type WindowedRateLimiterConfig = {
  strategy: CallbackBatcherStrategies.WINDOWED_RATE_LIMITER;
} & WindowedRateLimiterBatcherConfig;

/**
 * The main config argument passed to callbackBatcherFactory
 */
export type CallbackBatcherFactoryConfig =
  | DefaultConfig
  | LeakyBucketConfig
  | WindowedRateLimiterConfig;

/**
 * A factory function which allows configuring and creating callback batchers
 * following a particular stategy for callback rate-limiting and batching.
 *
 * What config arguments are required depends on what value is passed for the
 * `strategy` key in the config object.
 */
export function callbackBatcherFactory(
  config: CallbackBatcherFactoryConfig
): CallbackBatcher {
  let batcher: CallbackBactcherStrategy;
  switch (config.strategy) {
    case undefined: // default to Leaky Bucket
    case CallbackBatcherStrategies.LEAKY_BUCKET: {
      batcher = new LeakyBucketBatcher(config);
      break;
    }
    case CallbackBatcherStrategies.WINDOWED_RATE_LIMITER: {
      batcher = new WindowedRateLimiterBatcher(config);
      break;
    }
  }

  /**
   * Defaults the hash when undefined
   */
  const schedule: ScheduleFn = (callback, hash) => {
    if (hash) {
      batcher.schedule(hash, callback);
    } else {
      batcher.schedule(DEFAULT_HASH, callback);
    }
  };

  const disposer = batcher.destroy;

  return { schedule, disposer };
}
