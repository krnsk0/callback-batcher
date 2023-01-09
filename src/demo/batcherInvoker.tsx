import { useEffect, useRef, useState } from 'react';

interface BatcherInvokerProps {
  scheduleCallback: () => void;
}

/**
 * This component encapsulates concerns related to the user's contol
 * over callback batcher invocation
 */
export function BatcherInvoker({ scheduleCallback }: BatcherInvokerProps) {
  // rate of scheduler invocation
  const [invocationRate, setInvocationRate] = useState<number>(250);

  // allows clearing interval
  const intervalRef = useRef<number>(0);

  /**
   * Set up callback invocation on timer. Does not attempt to address
   * throttling when tab is inactive
   */
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (typeof invocationRate === 'number' && invocationRate > 0) {
      intervalRef.current = setInterval(() => {
        scheduleCallback();
      }, invocationRate) as unknown as number;
    }
    return () => clearInterval(intervalRef.current);
  }, [invocationRate]);

  /**
   * Allows changing the rate of the invoker
   */
  function handleRateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rate = parseInt(e.target.value);
    if (rate === 0) {
      stopInvoker();
    } else setInvocationRate(rate);
  }

  function stopInvoker() {
    setInvocationRate(0);
    clearInterval(intervalRef.current);
  }

  return (
    <div
      style={{
        padding: '10px',
      }}
    >
      <div>Schedule rate: </div>
      <input
        type="range"
        min="0"
        max="1500"
        value={invocationRate}
        onChange={handleRateChange}
      />
      <button onClick={stopInvoker} style={{ fontSize: '0.8em' }}>
        stop
      </button>
      <span style={{ marginLeft: '10px' }}>{invocationRate}ms</span>
      <div>
        <button
          type="button"
          onClick={scheduleCallback}
          style={{ marginTop: '10px' }}
        >
          Manually Schedule
        </button>
      </div>
    </div>
  );
}
