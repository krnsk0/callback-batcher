import {
  findParent,
  model,
  Model,
  modelAction,
  tProp,
  types,
} from 'mobx-keystone';
import { computed } from 'mobx';
import { CallbackBatcher } from '../lib';

/**
 * How "zoomed in" is the timeline?
 */
const MS_PER_PIXEL = 10;

/**
 * Clean up points older than this window
 */
const KEEP_POINT_DURATION = 10000;

@model('Point')
export class Point extends Model({
  timestamp: tProp(types.number, () => 0),
  callCount: tProp(types.number, () => 0),
}) {
  @computed
  get getPxOffset(): number {
    const pointAge = getRoot(this).currentTime - this.timestamp;
    const pxOffset = pointAge / MS_PER_PIXEL;
    return pxOffset;
  }
}

@model('StrategyDemo')
export class StrategyDemo extends Model({
  requestedCallbacks: tProp(types.array(Point), () => []),
  executedCallbacks: tProp(types.array(types.array(Point)), () => []),
}) {
  @modelAction
  removeOldPointsFromList(points: Point[]) {
    while (
      points.length &&
      points[0].timestamp <= getRoot(this).currentTime - KEEP_POINT_DURATION
    ) {
      points.shift();
    }
  }

  @modelAction
  tick(): void {
    this.removeOldPointsFromList(this.requestedCallbacks);
    // console.log(getSnapshot(this));
    this.executedCallbacks.forEach((list) => {
      this.removeOldPointsFromList(list);
    });
  }

  @modelAction
  requestCallback(batchers: CallbackBatcher[]): void {
    const timestamp = Date.now();
    this.requestedCallbacks.push(new Point({ timestamp }));
    batchers.forEach((batcher, batcherIndex) => {
      batcher.schedule(() => {
        // this.executedCallbacks
      });
    });
  }
}

@model('Root')
export class Root extends Model({
  strategyDemo: tProp(StrategyDemo, () => new StrategyDemo({})),
  currentTime: tProp(types.number, () => 0),
}) {
  @modelAction
  tick(): void {
    this.currentTime = Date.now();
  }
}

export const getRoot = (child: object): Root => {
  const root = findParent<Root>(child, (node) => {
    return node instanceof Root;
  });
  if (!root) throw new Error('no root model found in getRoot');
  return root;
};
