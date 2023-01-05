import LeakyBucketBatcher, {
  LeakyBucketBatcherConfig,
} from './strategies/leakyBucketBatcher';
import { BatchedCallback, CallbackBatcher } from './types';

export enum CallbackBatcherStrategies {
  TOKEN_BUCKET = 'TOKEN_BUCKET',
  // TODO
  WINDOWED_RATE_LIMITER = 'WINDOWED_RATE_LIMITER',
}

type LeakyBucketConfig = {
  strategy: CallbackBatcherStrategies.TOKEN_BUCKET;
} & LeakyBucketBatcherConfig;

type WindowedRateLimitedConfig = {
  strategy: CallbackBatcherStrategies.WINDOWED_RATE_LIMITER;
} & {
  // TODO
};

export type CallbackBatcherFactoryConfig =
  | LeakyBucketConfig
  | WindowedRateLimitedConfig;

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
