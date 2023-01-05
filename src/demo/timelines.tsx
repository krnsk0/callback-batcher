import {
  ExecutedCallbackTimeline,
  RequestedCallbackTimeline,
  Timeline,
} from './timeline';

const Timelines = ({
  requested,
  executed,
  offset,
}: {
  requested: RequestedCallbackTimeline;
  executed: ExecutedCallbackTimeline;
  offset: number;
}) => {
  return (
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
        data={executed}
        label={'executed callbacks with call count since last invocation'}
        offset={offset}
      />
    </div>
  );
};
export default Timelines;
