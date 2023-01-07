/**
 * How "zoomed in" is the timeline?
 */
export const MS_PER_PIXEL = 10;

/**
 * How large are circles on the timeline?
 */
const BULLET_SIZE = 22;

interface RequestedCallback {
  timestamp: number;
}

type ExecutedCallback = RequestedCallback & {
  callCount: number;
};

interface TimelineProps {
  data: RequestedCallback[] | ExecutedCallback[];
  label: string;
  offset: number;
}

/**
 * Helper component which displays an ordered list of calls
 */
export function Timeline({ data, label, offset }: TimelineProps) {
  return (
    <div
      style={{
        marginTop: '50px',
        height: `${BULLET_SIZE * 1.5}px`,
        position: 'relative',
        border: '1px solid black',
      }}
    >
      <div style={{ top: '-25px', position: 'relative' }}>{label}</div>

      {data.map((point) => {
        return (
          <span
            key={point.timestamp}
            style={{
              height: `${BULLET_SIZE}px`,
              width: `${BULLET_SIZE}px`,
              backgroundColor: !('callCount' in point) ? 'black' : 'white',
              border: '1px solid black',
              borderRadius: '50%',
              position: 'absolute',
              left: `${
                point.timestamp / MS_PER_PIXEL + offset - BULLET_SIZE / 2
              }px`,
              top: `${BULLET_SIZE / 6}px`,
              display: 'flex',
              justifyContent: 'center',
              fontFamily: 'sans-serif',
            }}
          >
            {'callCount' in point ? point.callCount : null}
          </span>
        );
      })}
    </div>
  );
}
