import React from 'react';
import { Row } from 'react-bootstrap';
import Widget from '../../common/models/Widget';
import IWidget from '../../common/models/IWidget';
import WidgetProps from '../../common/models/WidgetProps';
import IWidgetSettingsComponent, {
  WidgetSettingsProps,
} from '../../common/models/IWidgetSettingsComponent';
import ValuesConfig from './ValuesConfig';
import { TelemetrySample } from '../../common/models/Telemetry';
import ValuesSettings from './ValuesSettings';
import Value from './Value';

interface State {
  value: number;
}

class Values extends Widget<ValuesConfig, State> implements IWidget {
  static widgetId = 'b8865999-9778-4a84-96ea-705e268061eb';

  static widgetName = 'Live Values';

  valueRefs: React.RefObject<Value>[] = [];

  constructor(props: WidgetProps<ValuesConfig>) {
    super(props);
    this.state = {
      value: 0,
    };

    this.update = this.update.bind(this);
    this.saveDataPoint = this.saveDataPoint.bind(this);
  }

  static create(
    ref: React.RefObject<Values>,
    props: WidgetProps<ValuesConfig>,
  ): React.ReactElement<IWidget> | null {
    return <Values {...props} ref={ref} />;
  }

  static settingsComponent(
    ref: React.RefObject<ValuesSettings>,
    props: WidgetSettingsProps<ValuesConfig>,
  ): React.ReactElement<IWidgetSettingsComponent> {
    return <ValuesSettings {...props} ref={ref} />;
  }

  update(data: { [channel: number]: TelemetrySample }): void {
    for (const ref of this.valueRefs) {
      ref.current?.update(data);
    }
  }

  /**
   * Displays a value at the given time
   * @param time Time of the value to display
   */
  showValueAt(time: number): void {
    for (const ref of this.valueRefs) {
      ref.current?.showValueAt(time);
    }
  }

  saveDataPoint(data: { [channel: number]: TelemetrySample }): void {
    for (const ref of this.valueRefs) {
      ref.current?.saveDataPoint(data);
    }
  }

  render(): JSX.Element {
    const valueWidgetElements: JSX.Element[] = [];

    for (const channel of this.props.settings.config.channels) {
      const config = this.props.config.inputs.find(
        (inputConfig) => inputConfig.channelNumber === channel,
      );

      if (config) {
        const ref = React.createRef<Value>();
        valueWidgetElements.push(
          <Value
            key={`value-${config.channelNumber}`}
            config={config}
            data={[]}
            ref={ref}
          />,
        );
        this.valueRefs.push(ref);
      }
    }

    return <Row style={{ padding: '5px 0 5px 0' }}>{valueWidgetElements}</Row>;
  }
}

export default Values;
