import { useCallbackBatcher } from './useCallbackBatcher';
import { BatcherInvoker } from './batcherInvoker';
import Timeline from './timeline';
import { useAnimationFrame } from './useAnimationFrame';
import { observer } from 'mobx-react-lite';
import { useStore } from './storeProvider';

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

  const scheduleCallback = () => {
    store.strategyDemo.requestCallback([leakyBucketBatcher, windowedBatcher]);
  };

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
          data={store.strategyDemo.requestedCallbacks}
          label={'requested callbacks'}
          color="black"
          showCallCount={false}
        />
        <Timeline
          data={[]}
          label={'Leaky Bucket - Executed Callbacks w/ Call Count'}
          color="white"
          showCallCount={true}
        />
        <Timeline
          data={[]}
          label={'Windowed Rate Limiter - Executed Callbacks w/ Call Count'}
          color="white"
          showCallCount={true}
        />
      </div>
    </div>
  );
}

export default observer(Demo);
