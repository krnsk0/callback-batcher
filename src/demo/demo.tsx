import { useRef, useState } from 'react';
import { useCallbackBatcher } from './useCallbackBatcher';
import { BatcherInvoker } from './batcherInvoker';
import {
  ExecutedCallbackTimeline,
  MS_PER_PIXEL,
  RequestedCallbackTimeline,
  Timeline,
} from './timeline';
import { useAnimationFrame } from './useAnimationFrame';

/**
 * Simple demo of callback batcher. Re-renders on every animation frame;
 * discards data that will be rendered offscreen
 */
export function Demo() {
  const leakyBucketBatcher = useCallbackBatcher({
    strategy: 'LEAKY_BUCKET',
    maxTokens: 5,
    tokenRate: 1000,
  });
  const windowedBatcher = useCallbackBatcher({
    strategy: 'WINDOWED_RATE_LIMITER',
    windowSize: 1000,
    callsPerWindow: 2,
  });
  const startTime = useRef<number>(Date.now()).current;
  const [requested, setRequested] = useState<RequestedCallbackTimeline>([]);
  const [executedOne, setExecutedOne] = useState<ExecutedCallbackTimeline>([]);
  const [executedTwo, setExecutedTwo] = useState<ExecutedCallbackTimeline>([]);
  const [elapsed, setElapsed] = useState<number>(0);

  const stateRef = useRef<{
    requested: RequestedCallbackTimeline;
    executedOne: ExecutedCallbackTimeline;
    executedTwo: ExecutedCallbackTimeline;
    // clear entries prior to this time
    removeTime: number;
  }>({ requested: [], executedOne: [], executedTwo: [], removeTime: 0 });

  stateRef.current = {
    requested,
    executedOne,
    executedTwo,
    removeTime: elapsed - (window.innerWidth / 2) * MS_PER_PIXEL,
  };

  useAnimationFrame(() => {
    setElapsed(Date.now() - startTime);
  });

  function scheduleCallback() {
    leakyBucketBatcher.schedule((callCount) => {
      setExecutedOne([
        ...stateRef.current.executedOne.filter(
          (data) => data.timestamp >= stateRef.current.removeTime
        ),
        { timestamp: Date.now() - startTime, callCount },
      ]);
    }, 'default');
    windowedBatcher.schedule((callCount) => {
      setExecutedTwo([
        ...stateRef.current.executedTwo.filter(
          (data) => data.timestamp >= stateRef.current.removeTime
        ),
        { timestamp: Date.now() - startTime, callCount },
      ]);
    }, 'default');
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
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50vw', height: '100%' }}>
          <div
            style={{
              top: '5%',
              transform: `translate(-50%, 0)`,
            }}
          >
            now
          </div>
          <div
            style={{
              border: '1px solid black',
              height: '90%',
              top: '20%',
              width: '0px',
            }}
          />
        </div>
        <Timeline
          data={requested}
          label={'requested callbacks'}
          offset={offset}
        />
        <Timeline
          data={executedOne}
          label={'Leaky Bucket - Executed Callbacks w/ Call Count'}
          offset={offset}
        />
        <Timeline
          data={executedTwo}
          label={'Windowed Rate Limiter - Executed Callbacks w/ Call Count'}
          offset={offset}
        />
      </div>
    </div>
  );
}
