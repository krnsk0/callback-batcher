import { useEffect, useRef, useState } from 'react';

const INVOCATION_RATES = [
  100,
  250,
  500,
  750,
  1000,
  1500,
  2000,
  'stop',
] as const;

interface BatcherInvokerProps {
  scheduleCallback: () => void;
}

/**
 * This component encapsulates concerns related to the user's contol
 * over callback batcher invocation
 */
export function BatcherInvoker({ scheduleCallback }: BatcherInvokerProps) {
  // rate of scheduler invocation
  const [invocationRate, setInvocationRate] =
    useState<typeof INVOCATION_RATES[number]>(250);

  // allows clearing interval
  const intervalRef = useRef<number>(0);

  /**
   * Set up callback invocation on timer. Does not attempt to address
   * throttling when tab is inactive
   */
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (typeof invocationRate === 'number') {
      intervalRef.current = setInterval(() => {
        scheduleCallback();
      }, invocationRate) as unknown as number;
    }
    return () => clearInterval(intervalRef.current);
  }, [invocationRate]);

  /**
   * Allows changing the rate of the invoker
   */
  function handleRateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRate = (
      e.target.value === 'stop' ? e.target.value : parseInt(e.target.value)
    ) as typeof INVOCATION_RATES[number];
    setInvocationRate(newRate);
  }

  return (
    <div
      style={{
        border: '1px solid black',
        padding: '10px',
      }}
    >
      <div>
        <strong>invoke the callback bacher</strong>
      </div>
      <div
        style={{ marginTop: '10px', display: 'flex', alignContent: 'center' }}
      >
        <span style={{ marginRight: '10px' }}>
          invocation rate: {invocationRate}ms
        </span>
        <select name="rate" onChange={handleRateChange} value={invocationRate}>
          {INVOCATION_RATES.map((rate) => {
            return (
              <option key={rate} value={rate}>
                {rate}
              </option>
            );
          })}
        </select>
      </div>
      <button
        type="button"
        onClick={scheduleCallback}
        style={{ marginTop: '10px' }}
      >
        manually schedule
      </button>
    </div>
  );
}
