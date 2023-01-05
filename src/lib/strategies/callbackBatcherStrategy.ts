import { BatchedCallback } from 'lib/types';

/**
 * This interface describes callback batchers, in general, following
 * the strategy pattern
 */
export default interface CallbackBactcherStrategy {
  /**
   * Must clean up any effects or timers
   */
  destroy: () => void;

  /**
   * Given a hash and a callback, invokes the callback when appropriate
   * to do so
   */
  schedule: (hash: string, callback: BatchedCallback) => void;
}
