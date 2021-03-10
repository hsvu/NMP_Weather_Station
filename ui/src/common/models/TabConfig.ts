import WidgetSettings from './WidgetSettings';

export default interface TabConfig {
  name: string;
  widgets: TabWidgetConfig[][];
}

export interface TabWidgetConfig {
  widgetId: string;
  settings: WidgetSettings<unknown>;
}
