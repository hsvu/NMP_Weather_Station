import Config from './Config';
import { TelemetrySample } from './Telemetry';
import WidgetSettings from './WidgetSettings';

export default interface WidgetProps<T> {
  data?: { [channel: number]: TelemetrySample[] };
  hoverEventHandler?: (time: number) => void;
  settings: WidgetSettings<T>;
  config: Config;
}
