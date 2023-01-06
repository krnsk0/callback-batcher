import { BatchedCallback } from '../types';
import CallbackBactcherStrategy from './callbackBatcherStrategy';

/**
 * Configuration for the windowed rate limiter batcher strategy
 */
export interface WindowedRateLimiterBatcherConfig {
  /**
   * How large is the window, in milliseconds?
   */
  windowSize: number;
  /**
   * How many calls are allowed per window?
   */
  callsPerWindow: number;
}

interface EntryInitialParams {
  callback: BatchedCallback;
}

/**
 * A helper class that encapsultates state for a rate-limited callback.
 */
class Entry {
  countSinceLastLog = 0;

  callback: BatchedCallback;

  invocationRecord: number[] = [];

  constructor({ callback }: EntryInitialParams) {
    this.callback = callback;
  }

  replaceCallback(callback: BatchedCallback) {
    this.callback = callback;
  }

  incrementCallCount(): void {
    this.countSinceLastLog += 1;
  }

  purgeOldCalls(windowStart: number): void {
    while (
      this.invocationRecord.length &&
      this.invocationRecord[0] <= windowStart
    ) {
      this.invocationRecord.shift();
    }
  }

  maybeInvokeCallback({ callsPerWindow }: { callsPerWindow: number }): void {
    if (
      this.countSinceLastLog > 0 &&
      this.invocationRecord.length < callsPerWindow
    ) {
      this.callback(this.countSinceLastLog);
      this.countSinceLastLog = 0;
      this.invocationRecord.push(Date.now());
    }
  }

  tailingCallbackCall(): void {
    this.callback(this.countSinceLastLog);
    this.countSinceLastLog = 0;
  }
}

/**
 * This batcher strategy keeps track of the time when invocations are requested
 * for a window extending into the past by `windowSize`. If the callback is
 * invoked more than `callsPerWindow` during this backwards-looking unit of time,
 * then calls are blocked.
 *
 * Batched calls are reported via the `count` parameter passed to the callback
 * when it is invoked in a non-rate-limited context.
 *
 * Periodically clears out state to save memory (every `windowSize` ms), and
 * sends any batched tailing calls when this takes place.
 */
export default class WindowedRateLimiterBatcher
  implements CallbackBactcherStrategy
{
  private hashmap: Record<string, Entry> = {};

  private windowSize: number;

  private callsPerWindow: number;

  private intervalId: number;

  constructor({
    windowSize,
    callsPerWindow,
  }: WindowedRateLimiterBatcherConfig) {
    this.windowSize = windowSize;
    this.callsPerWindow = callsPerWindow;
    this.intervalId = setInterval(() => {
      this.purgeEntriesAndMaybeInvoke();
    }, windowSize) as unknown as number;
  }

  destroy = (): void => {
    clearInterval(this.intervalId);
    this.purgeEntriesAndMaybeInvoke();
  };

  private windowStart() {
    return Date.now() - this.windowSize;
  }

  private purgeEntriesAndMaybeInvoke() {
    Object.entries(this.hashmap).forEach(([hash, entry]) => {
      entry.purgeOldCalls(this.windowStart());
      if (entry.countSinceLastLog > 0) {
        entry.tailingCallbackCall();
      }

      if (
        entry.countSinceLastLog === 0 &&
        entry.invocationRecord.length === 0
      ) {
        delete this.hashmap[hash];
      }
    });
  }

  private findOrCreateEntry = (
    hash: string,
    callback: BatchedCallback
  ): Entry => {
    const entry =
      this.hashmap[hash] ??
      new Entry({
        callback,
      });
    this.hashmap[hash] = entry;
    // Returning the entry ensures we don't need to repeatedly look up the entry
    // in the hash in order to mutate it in other methods, as lookup can be
    // worse than constant time in the edge case where there are very many
    // distinct hash entries.
    return entry;
  };

  schedule = (hash: string, callback: BatchedCallback): void => {
    const entry = this.findOrCreateEntry(hash, callback);
    entry.replaceCallback(callback);
    entry.incrementCallCount();
    entry.purgeOldCalls(this.windowStart());
    entry.maybeInvokeCallback({
      callsPerWindow: this.callsPerWindow,
    });
  };
}
