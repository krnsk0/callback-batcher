import {
  callbackBatcherFactory,
  CallbackBatcherFactoryConfig,
  CallbackBatcherStrategies,
} from '../lib';
import { useRef } from 'react';
import { CallbackBatcher } from '../lib/types';

/**
 * React-hook wrapper for callbackBatcherFactory. Instantiates
 * the batcher synchronously during first render.
 */
export function useCallbackBatcher() {
  const config: CallbackBatcherFactoryConfig = {
    strategy: CallbackBatcherStrategies.TOKEN_BUCKET,
    maxTokens: 5,
    tokenRate: 1000,
  };

  const batcherRef = useRef<CallbackBatcher>();

  if (!batcherRef.current) {
    batcherRef.current = callbackBatcherFactory(config);
  }

  return batcherRef.current;
}
