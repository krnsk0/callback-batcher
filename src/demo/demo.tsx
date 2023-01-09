import { BatcherInvoker } from './batcherInvoker';
import Timeline from './timeline';
import { useAnimationFrame } from './useAnimationFrame';
import { observer } from 'mobx-react-lite';
import { useStore } from './storeProvider';
import LeakyController from './leakyController';
import { useRef } from 'react';
import { CallbackBatcher } from '../lib';
import WindowedController from './windowedController';

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
  const windowedBatcherRef = useRef<CallbackBatcher>();

  const scheduleCallback = () => {
    store.strategyDemo.requestCallback({
      leakyBucketBatcher: leakyBucketBatcherRef.current,
      windowedBatcher: windowedBatcherRef.current,
    });
  };

  return (
    <div style={{ width: '97vw' }}>
      <h1>callback-batcher demo</h1>

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
        <BatcherInvoker scheduleCallback={scheduleCallback} />
        <Timeline
          data={store.strategyDemo.leakyBucketCallbacks}
          label={'Leaky Bucket'}
          color="lightblue"
          showCallCount={true}
        />
        <LeakyController batcherRef={leakyBucketBatcherRef} />
        <Timeline
          data={store.strategyDemo.windowedCallbacks}
          label={'Windowed Rate Limiter'}
          color="orange"
          showCallCount={true}
        />
        <WindowedController batcherRef={windowedBatcherRef} />
      </div>
    </div>
  );
}

export default observer(Demo);
