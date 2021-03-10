import Widget from '../common/models/Widget';
import Charts from './chart/Charts';
import LapTimer from './lapTimer/lapTimer';
import Values from './values/Values';

const widgets: { [widgetId: string]: typeof Widget } = {
  [Values.widgetId]: Values,
  [Charts.widgetId]: Charts,
  [LapTimer.widgetId]: LapTimer,
};

export const widgetsList = Object.values(widgets);

export default widgets;
