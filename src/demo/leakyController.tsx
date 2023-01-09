import { useState } from 'react';
import { CallbackBatcher, makeCallbackBatcher } from '../lib';

interface LeakyControllerProps {
  batcherRef: React.MutableRefObject<CallbackBatcher | undefined>;
}

function recreateBatcher({
  batcherRef,
  maxTokens,
  tokenRate,
}: {
  batcherRef: React.MutableRefObject<CallbackBatcher | undefined>;
  maxTokens: number;
  tokenRate: number;
}) {
  batcherRef.current = makeCallbackBatcher({
    strategy: 'LEAKY_BUCKET',
    maxTokens,
    tokenRate,
  });
}

function LeakyController({ batcherRef }: LeakyControllerProps) {
  const [maxTokens, setMaxTokens] = useState<number>(3);
  const [tokenRate, setTokenRate] = useState<number>(1000);

  function handleMaxTokenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    setMaxTokens(val);
    recreateBatcher({ batcherRef, maxTokens: val, tokenRate });
  }

  function handleRateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    setTokenRate(val);
    recreateBatcher({ batcherRef, maxTokens, tokenRate: val });
  }

  if (!batcherRef.current) {
    recreateBatcher({ batcherRef, maxTokens, tokenRate });
  }

  return (
    <div
      style={{
        padding: '10px',
      }}
    >
      <div>Max Tokens:</div>
      <div>
        <input
          type="range"
          min="1"
          max="20"
          value={maxTokens}
          onChange={handleMaxTokenChange}
        />
        <span>{maxTokens} tokens</span>
      </div>
      <div>Token rate:</div>
      <div>
        <input
          type="range"
          min="100"
          max="4000"
          value={tokenRate}
          onChange={handleRateChange}
        />
        <span>{tokenRate}ms</span>
      </div>
    </div>
  );
}

export default LeakyController;
