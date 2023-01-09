import { useState } from 'react';
import { CallbackBatcher, makeCallbackBatcher } from '../lib';

interface WindowedControllerProps {
  batcherRef: React.MutableRefObject<CallbackBatcher | undefined>;
}

function recreateBatcher({
  batcherRef,
  windowSize,
  callsPerWindow,
}: {
  batcherRef: React.MutableRefObject<CallbackBatcher | undefined>;
  windowSize: number;
  callsPerWindow: number;
}) {
  batcherRef.current = makeCallbackBatcher({
    strategy: 'WINDOWED_RATE_LIMITER',
    windowSize,
    callsPerWindow,
  });
}

function WindowedController({ batcherRef }: WindowedControllerProps) {
  const [windowSize, setWindowSize] = useState<number>(1000);
  const [callsPerWindow, setCallsPerWindow] = useState<number>(2);

  function handleWindowSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    setWindowSize(val);
    recreateBatcher({ batcherRef, windowSize: val, callsPerWindow });
  }

  function handleCallsPerWindowChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    setCallsPerWindow(val);
    recreateBatcher({ batcherRef, windowSize, callsPerWindow: val });
  }

  if (!batcherRef.current) {
    recreateBatcher({
      batcherRef,
      windowSize,
      callsPerWindow,
    });
  }

  return (
    <div
      style={{
        padding: '10px',
      }}
    >
      <div>Window Size:</div>
      <div>
        <input
          type="range"
          min="100"
          max="2000"
          value={windowSize}
          onChange={handleWindowSizeChange}
        />
        <span>{windowSize} ms</span>
      </div>
      <div>Calls per window:</div>
      <div>
        <input
          type="range"
          min="1"
          max="20"
          value={callsPerWindow}
          onChange={handleCallsPerWindowChange}
        />
        <span>{callsPerWindow} calls</span>
      </div>
    </div>
  );
}

export default WindowedController;
