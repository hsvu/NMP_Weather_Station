import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import IWidgetSettingsComponent, {
  WidgetSettingsProps,
} from '../../common/models/IWidgetSettingsComponent';
import WidgetSettings from '../../common/models/WidgetSettings';
import LapTimerConfig from './lapTimerConfig';

class LapTimerSettings
  extends React.Component<
    WidgetSettingsProps<LapTimerConfig>,
    WidgetSettings<LapTimerConfig>
  >
  implements IWidgetSettingsComponent {
  constructor(props: WidgetSettingsProps<LapTimerConfig>) {
    super(props);

    this.state = {
      width: props.existingSettings?.width || 6,
      mobileWidth: props.existingSettings?.mobileWidth || 12,
      config: {
        channel: props.config.outputs.live[0] || -1,
        manualInput: 1,
        targetLaps: 1,
      },
    };
  }

  componentDidMount(): void {
    setImmediate(() => this.props.onSettingsChange(this.state));
  }

  componentDidUpdate(): void {
    this.props.onSettingsChange(this.state);
  }

  onChannelChange(newChannel: number): void {
    const newState = this.state;
    newState.config.channel = newChannel;

    this.setState(newState);
  }

  onModeChange(newMode: number): void {
    const newState = this.state;
    newState.config.manualInput = newMode;

    this.setState(newState);
  }

  onLapTargetChange(newTarget: number): void {
    const newState = this.state;
    newState.config.targetLaps = newTarget;

    this.setState(newState);
  }

  validState(): boolean {
    return this.state.config.channel >= 0;
  }

  render(): JSX.Element {
    const valueOptions = this.props.config.inputs.map((inputConfig) => (
      <option key={inputConfig.channelNumber} value={inputConfig.channelNumber}>
        {inputConfig.channelName}
      </option>
    ));

    return (
      <Container>
        <form>
          <Row>
            <Col>
              Input:
              <select
                id="modeSelect"
                value={this.state.config.manualInput}
                onChange={(event): void =>
                  this.onModeChange(parseInt(event.target.value, 2))
                }
              >
                <option value="1"> Manual Input </option>
                <option value="0"> Lap Beacon </option>
              </select>
            </Col>
          </Row>
          <Row>
            <Col>
              <div id="targetLaps">
                Target Laps:
                <input
                  type="number"
                  value={this.state.config.targetLaps}
                  onChange={(event): void =>
                    this.onLapTargetChange(parseInt(event.target.value, 10))
                  }
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              Channel:
              <select
                value={this.state.config.channel}
                onChange={(event): void =>
                  this.onChannelChange(parseInt(event.target.value, 10))
                }
              >
                {valueOptions}
              </select>
            </Col>
          </Row>
        </form>
      </Container>
    );
  }
}

export default LapTimerSettings;
