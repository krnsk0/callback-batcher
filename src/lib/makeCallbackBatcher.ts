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
 * If the user does not pass a strategy, we fall back on Leaky Bucket
 */
type DefaultConfig = { strategy?: undefined } & LeakyBucketBatcherConfig;

/**
 * Config values to be passed when using the Leaky Bucket strategy
 */
type LeakyBucketConfig = {
  strategy: 'LEAKY_BUCKET';
} & LeakyBucketBatcherConfig;

/**
 * Config values to be passed when using the Windowed Rate Limiter strategy
 */
type WindowedRateLimiterConfig = {
  strategy: 'WINDOWED_RATE_LIMITER';
} & WindowedRateLimiterBatcherConfig;

/**
 * The main config argument passed to makeCallbackBatcher
 */
export type makeCallbackBatcherConfig =
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
export function makeCallbackBatcher(
  config: makeCallbackBatcherConfig
): CallbackBatcher {
  let batcher: CallbackBactcherStrategy;
  switch (config.strategy) {
    case undefined: // default to Leaky Bucket
    case 'LEAKY_BUCKET': {
      batcher = new LeakyBucketBatcher(config);
      break;
    }
    case 'WINDOWED_RATE_LIMITER': {
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
