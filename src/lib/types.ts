/**
 * Describes the callback invoked by the batcher, which is passed a count
 * of attempted invocations since the last sucessful invocation
 */
export type BatchedCallback = (count: number) => void;

/**
 * Describes the function used to request invocation of a callback. Callbacks
 * are paired with a hash which uniquely identifies them. This allows keeing
 * separate state for many callbacks.
 */
export type ScheduleFn = (hash: string, callback: BatchedCallback) => void;

/**
 * The return type of callback batcher factories
 */
export interface CallbackBatcher {
  schedule: ScheduleFn;
  disposer: () => void;
}
