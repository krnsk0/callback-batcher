import { callbackBatcherFactory, CallbackBatcherFactoryConfig } from '../lib';
import { useRef } from 'react';
import { CallbackBatcher } from '../lib/types';

/**
 * React-hook wrapper for callbackBatcherFactory. Instantiates
 * the batcher synchronously during first render.
 */
export function useCallbackBatcher(config: CallbackBatcherFactoryConfig) {
  const batcherRef = useRef<CallbackBatcher>();

  if (!batcherRef.current) {
    batcherRef.current = callbackBatcherFactory(config);
  }

  return batcherRef.current;
}
