import { BatchedCallback } from '../types';
import CallbackBactcherStrategy from './callbackBatcherStrategy';

/**
 * Configuration for the token bucket batcher strategy
 */
export interface LeakyBucketBatcherConfig {
  /**
   * How many calls in a short period of time are allowed through without
   * rate limiting, for a given hash? E.g. How many tokens does an entry
   * start with in its token bucket?
   */
  maxTokens: number;
  /**
   * How often are new tokens added, in milliseconds?
   */
  tokenRate: number;
}

/**
 * Used internally by the token batcher strategy
 */
interface EntryInitialParams {
  tokens: number;
  callback: BatchedCallback;
}

/**
 * A helper class that encapsultates state for a rate-limited callback
 */
class Entry {
  countSinceLastLog = 0;

  tokens: number;

  callback: BatchedCallback;

  constructor({ tokens, callback }: EntryInitialParams) {
    this.tokens = tokens;
    this.callback = callback;
  }

  replaceCallback(callback: BatchedCallback) {
    this.callback = callback;
  }

  incrementCallCount(): void {
    this.countSinceLastLog += 1;
  }

  maybeInvokeCallback(): void {
    if (this.tokens > 0 && this.countSinceLastLog) {
      this.callback(this.countSinceLastLog);
      this.countSinceLastLog = 0;
      this.tokens -= 1;
    }
  }

  maybeIncrementToken({ maxTokens }: { maxTokens: number }) {
    this.tokens = Math.min(this.tokens + 1, maxTokens);
  }
}

export default class LeakyBucketBatcher implements CallbackBactcherStrategy {
  private hashmap: Record<string, Entry> = {};

  private maxTokens: number;

  private intervalId: number;

  constructor({ maxTokens, tokenRate }: LeakyBucketBatcherConfig) {
    this.maxTokens = maxTokens;
    this.intervalId = setInterval(() => {
      this.addTokensAndInvokeBatchedCallbacks();
    }, tokenRate) as unknown as number;
  }

  destroy = (): void => {
    clearInterval(this.intervalId);
    this.addTokensAndInvokeBatchedCallbacks();
  };

  private findOrCreateEntry = (
    hash: string,
    callback: BatchedCallback
  ): Entry => {
    const entry =
      this.hashmap[hash] ??
      new Entry({
        tokens: this.maxTokens,
        callback,
      });
    this.hashmap[hash] = entry;
    // Returning the entry ensures we don't need to repeatedly look up the entry
    // in the hash in order to mutate it in other methods, as lookup can be
    // worse than constant time in the edge case where there are very many
    // distinct hash entries.
    return entry;
  };

  private addTokensAndInvokeBatchedCallbacks = (): void => {
    Object.entries(this.hashmap).forEach(([hash, entry]) => {
      entry.maybeIncrementToken({ maxTokens: this.maxTokens });
      entry.maybeInvokeCallback();

      // remove entries that we don't need anymore
      const { countSinceLastLog, tokens } = entry;
      if (countSinceLastLog === 0 && tokens === this.maxTokens) {
        delete this.hashmap[hash];
      }
    });
  };

  /**
   * Schedule the execution of a callback; may execute immediately or after a
   * delay, if rate-limited.
   */
  schedule = (hash: string, callback: BatchedCallback): void => {
    const entry = this.findOrCreateEntry(hash, callback);
    entry.replaceCallback(callback);
    entry.incrementCallCount();
    entry.maybeInvokeCallback();
  };
}
