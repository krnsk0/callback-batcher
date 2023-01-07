import { useCallbackBatcher } from './useCallbackBatcher';
import { BatcherInvoker } from './batcherInvoker';
import { Timeline } from './timeline';
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

  useAnimationFrame(() => {
    // TODO
  });

  return (
    <div style={{ width: '97vw' }}>
      <h1>callback batcher / rate-limiter demo</h1>
      <BatcherInvoker
        scheduleCallback={() => {
          // TODO
        }}
      />
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
        <Timeline data={[]} label={'requested callbacks'} offset={0} />
        <Timeline
          data={[]}
          label={'Leaky Bucket - Executed Callbacks w/ Call Count'}
          offset={0}
        />
        <Timeline
          data={[]}
          label={'Windowed Rate Limiter - Executed Callbacks w/ Call Count'}
          offset={0}
        />
      </div>
    </div>
  );
}
