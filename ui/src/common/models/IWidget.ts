import { TelemetrySample } from './Telemetry';
import WidgetProps from './WidgetProps';

export default interface IWidget
  extends React.Component<WidgetProps<unknown>, {}> {
  showValueAt(time: number): void;
  update(data: { [channel: number]: TelemetrySample }): void;
  saveDataPoint(data: { [channel: number]: TelemetrySample }): void;
}
