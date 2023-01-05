import { useRef, useState } from 'react';
import { useCallbackBatcher } from './useCallbackBatcher';
import { BatcherInvoker } from './batcherInvoker';
import {
  ExecutedCallbackTimeline,
  MS_PER_PIXEL,
  RequestedCallbackTimeline,
} from './timeline';
import Timelines from './timelines';
import { useAnimationFrame } from './useAnimationFrame';

/**
 * Simple demo of callback batcher. Re-renders on every animation frame;
 * discards data that will be rendered offscreen
 */
export function Demo() {
  const batcher = useCallbackBatcher();
  const startTime = useRef<number>(Date.now()).current;
  const [requested, setRequested] = useState<RequestedCallbackTimeline>([]);
  const [executed, setExecuted] = useState<ExecutedCallbackTimeline>([]);
  const [elapsed, setElapsed] = useState<number>(0);

  const stateRef = useRef<{
    requested: RequestedCallbackTimeline;
    executed: ExecutedCallbackTimeline;
    // clear entries prior to this time
    removeTime: number;
  }>({ requested: [], executed: [], removeTime: 0 });

  stateRef.current = {
    requested,
    executed,
    removeTime: elapsed - (window.innerWidth / 2) * MS_PER_PIXEL,
  };

  useAnimationFrame(() => {
    setElapsed(Date.now() - startTime);
  });

  function scheduleCallback() {
    batcher.schedule('default', (callCount) => {
      setExecuted([
        ...stateRef.current.executed.filter(
          (data) => data.timestamp >= stateRef.current.removeTime
        ),
        { timestamp: Date.now() - startTime, callCount },
      ]);
    });
    setRequested([
      ...stateRef.current.requested.filter(
        (data) => data.timestamp >= stateRef.current.removeTime
      ),
      { timestamp: Date.now() - startTime },
    ]);
  }

  const offset = window.innerWidth / 2 - elapsed / MS_PER_PIXEL;

  return (
    <div style={{ width: '97vw' }}>
      <h1>callback batcher / rate-limiter demo</h1>
      <BatcherInvoker scheduleCallback={scheduleCallback} />
      <Timelines requested={requested} executed={executed} offset={offset} />
    </div>
  );
}
