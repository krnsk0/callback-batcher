import LeakyBucketBatcher, {
  LeakyBucketBatcherConfig,
} from './strategies/leakyBucketBatcher';
import { BatchedCallback, CallbackBatcher } from './types';

/**
 * This library exposes several strategies for managing the timing of scheduled
 * callbacks corresponding to entries in this enum.
 */
export enum CallbackBatcherStrategies {
  TOKEN_BUCKET = 'TOKEN_BUCKET',
  // TODO
  WINDOWED_RATE_LIMITER = 'WINDOWED_RATE_LIMITER',
}

/**
 * Config values to be passed when using the Leaky Bucket strategy
 */
type LeakyBucketConfig = {
  strategy: CallbackBatcherStrategies.TOKEN_BUCKET;
} & LeakyBucketBatcherConfig;

/**
 * Config values to be passed when using the Windowed Rate Limiter strategy
 */
type WindowedRateLimitedConfig = {
  strategy: CallbackBatcherStrategies.WINDOWED_RATE_LIMITER;
} & {
  // TODO
};

/**
 * The main config argument passed to callbackBatcherFactory
 */
export type CallbackBatcherFactoryConfig =
  | LeakyBucketConfig
  | WindowedRateLimitedConfig;

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
  switch (config.strategy) {
    case CallbackBatcherStrategies.TOKEN_BUCKET: {
      const batcher = new LeakyBucketBatcher(config);
      const schedule = batcher.schedule;
      const disposer = batcher.destroy;
      return { schedule, disposer };
    }
    // TODO
    case CallbackBatcherStrategies.WINDOWED_RATE_LIMITER: {
      return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
        schedule: (hash: string, callback: BatchedCallback) => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        disposer: () => {},
      };
    }
  }
}
