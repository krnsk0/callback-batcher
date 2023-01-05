import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import LeakyBucketBatcher from './leakyBucketBatcher';

describe('The leakyBucketBatcher class', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('should immediately invoke the callback when not in a rate-limited context', () => {
    const batcher = new LeakyBucketBatcher({ maxTokens: 3, tokenRate: 1000 });
    const callback = vi.fn();
    batcher.schedule('example_hash', callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(1);
    batcher.destroy();
  });

  test('should only invoke the callback with as many tokens as are configured to be initially available, ignoring subsequent calls', () => {
    const batcher = new LeakyBucketBatcher({ maxTokens: 3, tokenRate: 1000 });
    const callback = vi.fn();
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('example_hash', callback);
    }
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenLastCalledWith(1);
    batcher.destroy();
  });

  test('should maintain a separate token count for each distinct hash value', () => {
    const batcher = new LeakyBucketBatcher({
      maxTokens: 3,
      tokenRate: 1000,
    });
    const callbackOne = vi.fn();
    const callbackTwo = vi.fn();
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('one', callbackOne);
    }
    batcher.schedule('two', callbackTwo);
    expect(callbackTwo).toHaveBeenCalledTimes(1);
    batcher.destroy();
  });

  test('should allow larger bursts of callback invocations when passed a higher max token count', () => {
    const callbackOne = vi.fn();
    const callbackTwo = vi.fn();
    const batcherOne = new LeakyBucketBatcher({
      maxTokens: 10,
      tokenRate: 1000,
    });
    const batcherTwo = new LeakyBucketBatcher({
      maxTokens: 3,
      tokenRate: 1000,
    });
    for (let i = 0; i < 30; i += 1) {
      batcherOne.schedule('example_hash', callbackOne);
      batcherTwo.schedule('example_hash', callbackTwo);
    }
    expect(callbackOne).toHaveBeenCalledTimes(10);
    expect(callbackTwo).toHaveBeenCalledTimes(3);
    batcherOne.destroy();
    batcherTwo.destroy();
  });

  test('should batch up calls after hitting the rate limit', () => {
    const batcher = new LeakyBucketBatcher({
      maxTokens: 3,
      tokenRate: 1000,
    });
    const callback = vi.fn();
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('example_hash', callback);
    }
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenLastCalledWith(1);
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenLastCalledWith(30 - 3);
    batcher.destroy();
  });

  test('should not allow more tokens to accumulate than the configured token max, limiting the burstiness of the callback', () => {
    const batcher = new LeakyBucketBatcher({
      maxTokens: 3,
      tokenRate: 1000,
    });
    const callback = vi.fn();
    batcher.schedule('example_hash', callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(1);
    vi.advanceTimersByTime(1000 * 10);
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('example_hash', callback);
    }
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenLastCalledWith(1);
    batcher.destroy();
  });

  test('should only invoke the most recently-passed-in callback when batching', () => {
    const batcher = new LeakyBucketBatcher({
      maxTokens: 3,
      tokenRate: 1000,
    });
    const callbackOne = vi.fn();
    const callbackTwo = vi.fn();

    // exhaust tokens
    for (let i = 0; i < 10; i += 1) {
      batcher.schedule('example_hash', callbackOne);
    }

    // schedule an invocation with a new callback
    batcher.schedule('example_hash', callbackTwo);

    vi.advanceTimersByTime(1000);
    expect(callbackOne).toHaveBeenCalledTimes(3);
    expect(callbackTwo).toHaveBeenCalledTimes(1);
    expect(callbackTwo).toHaveBeenCalledWith(8);
    batcher.destroy();
  });

  test('should run any batched, waiting callbacks on destroy', () => {
    const batcher = new LeakyBucketBatcher({
      maxTokens: 3,
      tokenRate: 1000,
    });
    const callback = vi.fn();
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('example_hash', callback);
    }
    batcher.destroy();
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenLastCalledWith(27);
  });

  test('should remove any maxed-out entries from the hashmap on each tick to save memory', () => {
    const batcher = new LeakyBucketBatcher({
      maxTokens: 3,
      tokenRate: 1000,
    });
    const callback = vi.fn();

    // we hit the rate limit
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('example_hash', callback);
    }
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(4);

    // after tokens hit max, there should be no entries
    // as the entry for the callback will get cleared out
    vi.advanceTimersByTime(3000);
    // array access lets us inspect the private class property
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(Object.entries(batcher['hashmap']).length).toBe(0);

    batcher.destroy();
  });
});
