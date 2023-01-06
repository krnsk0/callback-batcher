import { makeCallbackBatcher, makeCallbackBatcherConfig } from '../lib';
import { useRef } from 'react';
import { CallbackBatcher } from '../lib/types';

/**
 * React-hook wrapper for makeCallbackBatcher. Instantiates
 * the batcher synchronously during first render.
 */
export function useCallbackBatcher(config: makeCallbackBatcherConfig) {
  const batcherRef = useRef<CallbackBatcher>();

  if (!batcherRef.current) {
    batcherRef.current = makeCallbackBatcher(config);
  }

  return batcherRef.current;
}
