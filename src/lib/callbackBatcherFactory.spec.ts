import { describe, expect, test, vi } from 'vitest';
import { callbackBatcherFactory } from './callbackBatcherFactory';
import LeakyBucketBatcher from './strategies/leakyBucketBatcher';
import WindowedRateLimiterBatcher from './strategies/windowedRateLimiterBatcher';

vi.mock('./strategies/leakyBucketBatcher', () => {
  return {
    default: vi.fn(),
  };
});

vi.mock('./strategies/windowedRateLimiterBatcher', () => {
  return {
    default: vi.fn(),
  };
});

describe('The callbackBatcherFactory', () => {
  test('shoul default to leaky bucket when no strategy is passed', () => {
    callbackBatcherFactory({
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

  test('should instantiate with the token bucket strategy', () => {
    callbackBatcherFactory({
      strategy: 'LEAKY_BUCKET',
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
      strategy: 'WINDOWED_RATE_LIMITER',
      windowSize: 1000,
      callsPerWindow: 3,
    });

    expect(WindowedRateLimiterBatcher).toHaveBeenCalledWith(
      expect.objectContaining({ windowSize: 1000, callsPerWindow: 3 })
    );
  });

  test('should rate-limit with a default hash', async () => {
    vi.doUnmock('./strategies/leakyBucketBatcher');
    vi.resetModules();
    const { callbackBatcherFactory } = await import('./callbackBatcherFactory');
    const batcher = callbackBatcherFactory({ maxTokens: 3, tokenRate: 1000 });
    const callback = vi.fn();
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule(callback);
    }
    expect(callback).toHaveBeenCalledTimes(3);
    batcher.disposer();
  });

  test('should rate-limit with a hash explicitly passed in a separate token count for each distinct hash value', async () => {
    vi.doUnmock('./strategies/leakyBucketBatcher');
    vi.resetModules();
    const { callbackBatcherFactory } = await import('./callbackBatcherFactory');
    const batcher = callbackBatcherFactory({ maxTokens: 3, tokenRate: 1000 });
    const callbackOne = vi.fn();
    const callbackTwo = vi.fn();
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule(callbackOne, 'one');
    }
    batcher.schedule(callbackTwo, 'two');
    expect(callbackTwo).toHaveBeenCalledTimes(1);
    batcher.disposer();
  });
});
