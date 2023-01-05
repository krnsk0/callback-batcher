export type BatchedCallback = (count: number) => void;

export type ScheduleFn = (hash: string, callback: BatchedCallback) => void;

export interface CallbackBatcher {
  schedule: ScheduleFn;
  disposer: () => void;
}
