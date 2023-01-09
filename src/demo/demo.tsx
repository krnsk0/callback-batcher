import { useCallbackBatcher } from './useCallbackBatcher';
import { BatcherInvoker } from './batcherInvoker';
import Timeline from './timeline';
import { useAnimationFrame } from './useAnimationFrame';
import { observer } from 'mobx-react-lite';
import { useStore } from './storeProvider';
import LeakyController from './leakyController';
import { useRef } from 'react';
import { CallbackBatcher } from '../lib';

/**
 * Simple demo of callback batcher. Re-renders on every animation frame;
 * discards data that will be rendered offscreen
 */
function Demo() {
  const store = useStore();

  useAnimationFrame(() => {
    store.tick();
    store.strategyDemo.tick();
  });

  const leakyBucketBatcherRef = useRef<CallbackBatcher>();

  const windowedBatcher = useCallbackBatcher({
    strategy: 'WINDOWED_RATE_LIMITER',
    windowSize: 1000,
    callsPerWindow: 2,
  });

  const scheduleCallback = () => {
    store.strategyDemo.requestCallback({
      leakyBucketBatcher: leakyBucketBatcherRef.current,
      windowedBatcher,
    });
  };

  return (
    <div style={{ width: '97vw' }}>
      <h1>Callback-batcher Demo</h1>
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
              height: '100%',
              top: '20%',
              width: '0px',
            }}
          />
        </div>
        <Timeline
          data={store.strategyDemo.requestedCallbacks}
          label={'Scheduled Callbacks'}
          color="black"
          showCallCount={false}
        />

        <Timeline
          data={store.strategyDemo.leakyBucketCallbacks}
          label={'Leaky Bucket - Executed Callbacks w/ Call Count'}
          color="white"
          showCallCount={true}
        />
        <LeakyController batcherRef={leakyBucketBatcherRef} />
        <Timeline
          data={store.strategyDemo.windowedCallbacks}
          label={'Windowed Rate Limiter - Executed Callbacks w/ Call Count'}
          color="white"
          showCallCount={true}
        />
      </div>
    </div>
  );
}

export default observer(Demo);
