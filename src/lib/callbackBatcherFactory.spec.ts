import { describe, expect, test, vi } from 'vitest';
import {
  callbackBatcherFactory,
  CallbackBatcherStrategies,
} from './callbackBatcherFactory';
import LeakyBucketBatcher from './strategies/leakyBucketBatcher';
import WindowedRateLimiterBatcher from './strategies/windowedRateLimiterBatcher';

vi.mock('./strategies/leakyBucketBatcher', async () => {
  return {
    default: vi.fn(),
  };
});

vi.mock('./strategies/windowedRateLimiterBatcher', async () => {
  return {
    default: vi.fn(),
  };
});

describe('The callbackBatcherFactory', () => {
  test('should instantiate with the token bucket strategy', () => {
    callbackBatcherFactory({
      strategy: CallbackBatcherStrategies.LEAKY_BUCKET,
      maxTokens: 5,
      tokenRate: 1000,
    });

    expect(LeakyBucketBatcher).toHaveBeenCalledWith(
      expect.objectContaining({
        maxTokens: 5,
        tokenRate: 1000,
      })
    );
  });

  test('should instantiate with the windowed rate limiter strategy', () => {
    callbackBatcherFactory({
      strategy: CallbackBatcherStrategies.WINDOWED_RATE_LIMITER,
    });

    expect(WindowedRateLimiterBatcher).toHaveBeenCalledWith(
      expect.objectContaining({})
    );
  });
});
