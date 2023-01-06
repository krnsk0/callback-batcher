/**
 * Describes the callback invoked by the batcher, which is passed a count
 * of attempted invocations since the last sucessful invocation
 */
export type BatchedCallback = (count: number) => void;

/**
 * Describes the function used to request invocation of a callback.
 *
 * Callbacks may be paired with an "identifier hash" hash.
 *
 * This allows keeing separate timing/batching state for multiple callbacks
 * using a single batcher instance.
 */
export type ScheduleFn = (callback: BatchedCallback, hash?: string) => void;

/**
 * The return type of callback batcher factories
 */
export interface CallbackBatcher {
  schedule: ScheduleFn;
  disposer: () => void;
}
