import React from 'react';
import { InputConfig } from '../../common/models/Config';
import { TelemetrySample } from '../../common/models/Telemetry';
import style from './Value.module.css';

interface Props {
  config: InputConfig;
  data: TelemetrySample[];
}

interface State {
  value: number;
}

class Value extends React.Component<Props, State> {
  static widgetId = 'b8865999-9778-4a84-96ea-705e268061eb';

  static widgetName = 'Live Values';

  data: TelemetrySample[];

  ref = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      value: 0,
    };

    this.update = this.update.bind(this);
    this.saveDataPoint = this.saveDataPoint.bind(this);

    this.data = this.props.data;
  }

  update(data: { [channel: number]: TelemetrySample }): void {
    const packet = data[this.props.config.channelNumber];
    if (packet) {
      this.updateValue(packet.value);
      this.data.push(packet);
    }
  }

  updateValue(value: number): void {
    const ref = this.ref.current;

    if (ref) {
      this.props.config.ranges?.forEach((range) => {
        if (ref && value > range.low && value < range.high) {
          ref.style.color = range.colour;
        }
      });

      ref.innerText = (
        Math.round((value + Number.EPSILON) * 100) / 100
      ).toString();
    }
  }

  saveDataPoint(data: { [channel: number]: TelemetrySample }): void {
    if (data[this.props.config.channelNumber])
      this.data.push(data[this.props.config.channelNumber]);
  }

  /**
   * Displays a value at the given time
   * @param time Time of the value to display
   */
  showValueAt(time: number): void {
    // Find point
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].time >= time) {
        this.updateValue(this.data[i].value);
        break;
      }
    }
  }

  render(): JSX.Element {
    return (
      <div className={style.value}>
        <div className={style.name}>{this.props.config.channelName}</div>
        <div className={style.number} ref={this.ref}>
          {this.state.value}
        </div>
        <div className={style.units}>{this.props.config.units}</div>
      </div>
    );
  }
}

export default Value;
