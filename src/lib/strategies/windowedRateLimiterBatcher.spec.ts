import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import WindowedRateLimiterBatcher from './windowedRateLimiterBatcher';

describe('The WindowedRateLimiterBatcher class', () => {
  let originalNow: () => number;
  beforeEach(() => {
    originalNow = Date.now;
  });

  afterEach(() => {
    Date.now = originalNow;
  });

  test('should immediately invoke the callback when not in a rate-limited context', () => {
    const batcher = new WindowedRateLimiterBatcher({
      windowSize: 1000,
      callsPerWindow: 5,
    });
    const callback = vi.fn();
    batcher.schedule('example_hash', callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(1);
    batcher.destroy();
  });

  test('should not invoke the callback when exceeding the allowed number of calls in the window', () => {
    const batcher = new WindowedRateLimiterBatcher({
      windowSize: 1000,
      callsPerWindow: 5,
    });
    const callback = vi.fn();
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('example_hash', callback);
    }
    expect(callback).toHaveBeenCalledTimes(5);
    expect(callback).toHaveBeenLastCalledWith(1);
    batcher.destroy();
  });

  test('should rate-limit calls according to the window size', () => {
    const batcher = new WindowedRateLimiterBatcher({
      windowSize: 1000,
      callsPerWindow: 5,
    });
    const callback = vi.fn();

    // call 30 times in first second, only 5 calls go through
    // 25 get 'stored'
    Date.now = () => 10;
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('example_hash', callback);
    }
    expect(callback).toHaveBeenCalledTimes(5);
    expect(callback).toHaveBeenLastCalledWith(1);

    // after 1 second, we can call again
    Date.now = () => 1010;
    batcher.schedule('example_hash', callback);
    expect(callback).toHaveBeenCalledTimes(6);
    expect(callback).toHaveBeenLastCalledWith(26);

    batcher.destroy();
  });

  test('should rate-limit calls on a rolling basis as the window moves', () => {
    const batcher = new WindowedRateLimiterBatcher({
      windowSize: 1000,
      callsPerWindow: 5,
    });
    const callback = vi.fn();

    // call 5 times in first second
    let now = 0;
    Date.now = () => now;
    for (let i = 0; i < 5; i += 1) {
      batcher.schedule('example_hash', callback);
      now += 100;
    }
    expect(callback).toHaveBeenCalledTimes(5);
    expect(callback).toHaveBeenLastCalledWith(1);

    expect(now).toBe(500);
    now = 600; // now we're at 600, but still can't call
    batcher.schedule('example_hash', callback);
    expect(callback).toHaveBeenCalledTimes(5);
    expect(callback).toHaveBeenLastCalledWith(1);

    // can call again only at 1000
    now = 1000;
    batcher.schedule('example_hash', callback);
    expect(callback).toHaveBeenCalledTimes(6);
    expect(callback).toHaveBeenLastCalledWith(2); // since we missed a call

    // ...but can't call again until we wait more
    batcher.schedule('example_hash', callback);
    expect(callback).toHaveBeenCalledTimes(6);
    expect(callback).toHaveBeenLastCalledWith(2); // since we missed a call
    now = 1100;
    batcher.schedule('example_hash', callback);
    expect(callback).toHaveBeenCalledTimes(7);
    expect(callback).toHaveBeenLastCalledWith(2); // since we missed a call

    batcher.destroy();
  });

  test('should maintain a separate token count for each distinct hash value', () => {
    const batcher = new WindowedRateLimiterBatcher({
      windowSize: 1000,
      callsPerWindow: 5,
    });
    const callbackOne = vi.fn();
    const callbackTwo = vi.fn();
    for (let i = 0; i < 30; i += 1) {
      batcher.schedule('one', callbackOne);
    }
    batcher.schedule('two', callbackTwo);
    expect(callbackOne).toHaveBeenCalledTimes(5);
    expect(callbackTwo).toHaveBeenCalledTimes(1);
    batcher.destroy();
  });

  test('should only invoke the most recently-passed-in callback when batching', () => {
    const batcher = new WindowedRateLimiterBatcher({
      windowSize: 1000,
      callsPerWindow: 5,
    });
    const callbackOne = vi.fn();
    const callbackTwo = vi.fn();

    for (let i = 0; i < 3; i += 1) {
      batcher.schedule('example_hash', callbackOne);
    }
    expect(callbackOne).toHaveBeenCalledTimes(3);

    // schedule an invocation with a new callback
    batcher.schedule('example_hash', callbackTwo);

    expect(callbackOne).toHaveBeenCalledTimes(3);
    expect(callbackTwo).toHaveBeenCalledTimes(1);
    batcher.destroy();
  });
});
