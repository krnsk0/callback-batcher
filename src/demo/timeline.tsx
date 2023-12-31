import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { Point } from './store';

/**
 * How large are circles on the timeline?
 */
const BULLET_SIZE = 22;

interface TimelineProps {
  data: Point[];
  label: string;
  color: string;
  showCallCount: boolean;
}

/**
 * Helper component which displays an ordered list of calls
 */
function Timeline({ data, label, color, showCallCount }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const startPoint = containerRef.current
    ? containerRef.current.getBoundingClientRect().width -
      containerRef.current.getBoundingClientRect().width / 3
    : 0;

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: '50px',
        height: `${BULLET_SIZE * 1.5}px`,
        position: 'relative',
        border: '1px solid black',
      }}
    >
      <strong style={{ top: '-25px', position: 'relative' }}>{label}</strong>

      {data.map((point) => {
        return (
          <span
            key={point.id}
            style={{
              height: `${BULLET_SIZE}px`,
              width: `${BULLET_SIZE}px`,
              backgroundColor: color,
              border: '1px solid black',
              borderRadius: '50%',
              position: 'absolute',
              left: `${startPoint - point.getPxOffset}px`,
              top: `${BULLET_SIZE / 6}px`,
              display: 'flex',
              justifyContent: 'center',
              fontFamily: 'sans-serif',
            }}
          >
            {showCallCount ? point.callCount : null}
          </span>
        );
      })}
    </div>
  );
}

export default observer(Timeline);
