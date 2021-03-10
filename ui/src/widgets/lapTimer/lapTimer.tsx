import React from 'react';
import IWidget from '../../common/models/IWidget';
import IWidgetSettingsComponent, {
  WidgetSettingsProps,
} from '../../common/models/IWidgetSettingsComponent';
import Widget from '../../common/models/Widget';
import WidgetProps from '../../common/models/WidgetProps';
import LapTimerConfig from './lapTimerConfig';
import LapTimerSettings from './lapTimerSettings';
import './lapTimer.css';
import { TelemetrySample } from '../../common/models/Telemetry';

interface LaptimeHistory {
  lapNumbers: number[];
  laptimes: Time[];
  lapHistSum: number;
}

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
  raw: number;
}

interface LaptimerState {
  startTime: Time;
  currTime: Time;
  totalTime: Time;
  lapTime: Time;
  lapNum: number;
  running: boolean;
  finnished: boolean;
  wasLap: boolean; // Bolean to check if the previous data value was 1
  data: TelemetrySample[];
}

// TODO: Implement save button after run is stopped
// TODO: Hide Lap target in manual mode
// FIXME: Widget misbehaves with multiple laptime widgets present
// FIXME: Reset stop and lap buttons should not be enabled on startup
// FIXME: Switching between manual and beacon mode by editing the widget
//        does not work. Need to delete and re add widget to switch.

class LapTimer
  extends Widget<LapTimerConfig, LaptimerState>
  implements IWidget {
  static widgetId = 'e30ea571-ccd1-4ea7-949f-9c1f12045985';

  static widgetName = 'Lap Timer';

  gridRef = React.createRef<HTMLDivElement>();

  laptimeHist: LaptimeHistory;

  isManuallyOpperated: boolean;

  constructor(props: WidgetProps<LapTimerConfig>) {
    super(props);

    this.update = this.update.bind(this);

    this.laptimeHist = { lapNumbers: [], laptimes: [], lapHistSum: 0 };

    this.isManuallyOpperated = this.props.settings.config.manualInput === 1;

    this.state = {
      startTime: { hours: 0, minutes: 0, seconds: 0, raw: 0 },
      currTime: { hours: 0, minutes: 0, seconds: 0, raw: 0 },
      totalTime: { hours: 0, minutes: 0, seconds: 0, raw: 0 },
      lapTime: { hours: 0, minutes: 0, seconds: 0, raw: 0 },
      lapNum: 1,
      running: false,
      finnished: false,
      wasLap: false,
      data: props.data ? props.data[props.settings.config.channel] : [],
    };
  }

  /**
   * Displays a value at the given time
   * @param time Time of the value to display
   */
  showValueAt(time: number): void {
    // Find point
    for (let i = 0; i < this.state.data.length; i++) {
      if (time < this.state.data[i].time && !this.state.finnished) {
        this.update(this.state.data);
        break;
      }
    }
  }

  static create(
    ref: React.RefObject<LapTimer>,
    props: WidgetProps<LapTimerConfig>,
  ): React.ReactElement<IWidget> | null {
    return <LapTimer {...props} ref={ref} />;
  }

  static settingsComponent(
    ref: React.RefObject<LapTimerSettings>,
    props: WidgetSettingsProps<LapTimerConfig>,
  ): React.ReactElement<IWidgetSettingsComponent> {
    return <LapTimerSettings {...props} ref={ref} />;
  }

  update(data: { [channel: number]: TelemetrySample }): void {
    const isLap: boolean = data[this.props.settings.config.channel].value === 1;
    const shouldLap: boolean = isLap && !this.state.wasLap;
    if (!this.isManuallyOpperated && shouldLap) {
      if (this.state.running) {
        this.lap();
      } else if (!this.state.finnished) {
        this.start();
      }
      if (this.state.lapNum === this.props.settings.config.targetLaps + 1)
        this.stop();
    }

    const rawSeconds: number = data[this.props.settings.config.channel].time;
    const newTime: Time = this.rawToTime(rawSeconds);
    const newTotalTime: Time = this.rawToTime(
      newTime.raw - this.state.startTime.raw,
    );

    let newLaptime: Time;
    const oldLaptimes: Time[] = this.laptimeHist.laptimes;
    if (oldLaptimes.length > 0) {
      newLaptime = this.rawToTime(
        newTotalTime.raw - this.laptimeHist.lapHistSum,
      );
    } else {
      newLaptime = newTotalTime;
    }

    this.setState({
      currTime: newTime,
      totalTime: this.state.running ? newTotalTime : this.state.totalTime,
      lapTime: this.state.running ? newLaptime : this.state.lapTime,
      wasLap: isLap && this.isManuallyOpperated,
    });
  }

  saveDataPoint(data: { [channel: number]: TelemetrySample }): void {}

  rawToTime = (raw: number): Time => {
    const rawSeconds: number = raw;
    const minutes: number = Math.floor(rawSeconds / 60) % 60;
    const hours = Math.floor(minutes / 60);
    const seconds = Math.round((rawSeconds % 60) * 100) / 100;

    const time: Time = {
      hours,
      minutes,
      seconds,
      raw,
    };

    return time;
  };

  start = (): void => {
    if (!this.state.running) {
      this.reset();
      this.setState({
        startTime: this.rawToTime(this.state.currTime.raw),
        running: true,
      });
    } else {
      this.reset();
      this.setState({
        startTime: this.rawToTime(this.state.currTime.raw),
        running: true,
      });
    }

    // Enable all buttons
    if (this.isManuallyOpperated) {
      const stop = document.getElementById('stop') as HTMLButtonElement;
      const lap = document.getElementById('lap') as HTMLButtonElement;
      const reset = document.getElementById('reset') as HTMLButtonElement;
      stop.disabled = false;
      lap.disabled = false;
      reset.disabled = false;
    }
  };

  stop = (): void => {
    this.setState({
      running: false,
      finnished: true,
    });
    if (this.isManuallyOpperated) {
      // disable buttons
      const stop = document.getElementById('stop') as HTMLButtonElement;
      const lap = document.getElementById('lap') as HTMLButtonElement;
      const start = document.getElementById('start') as HTMLButtonElement;
      stop.disabled = true;
      lap.disabled = true;
      start.disabled = true;
    }
  };

  lap = (): void => {
    // update history
    this.laptimeHist.lapNumbers.push(this.state.lapNum);
    this.laptimeHist.laptimes.push(this.state.lapTime);
    this.laptimeHist.lapHistSum += this.state.lapTime.raw;

    const newLap = this.state.lapNum + 1;
    this.setState({
      lapTime: { hours: 0, minutes: 0, seconds: 0, raw: 0 },
      lapNum: newLap,
    });

    this.renderHist();
  };

  reset = (): void => {
    // document.documentElement.style.setProperty('--running', 'false');
    this.laptimeHist = { lapNumbers: [], laptimes: [], lapHistSum: 0 };

    this.setState({
      startTime: { hours: 0, minutes: 0, seconds: 0, raw: 0 },
      totalTime: { hours: 0, minutes: 0, seconds: 0, raw: 0 },
      lapTime: { hours: 0, minutes: 0, seconds: 0, raw: 0 },
      lapNum: 1,
      running: false,
      finnished: false,
    });

    this.renderHist();

    // Disable buttons
    if (this.isManuallyOpperated) {
      const stop = document.getElementById('stop') as HTMLButtonElement;
      const lap = document.getElementById('lap') as HTMLButtonElement;
      const reset = document.getElementById('reset') as HTMLButtonElement;
      stop.disabled = true;
      lap.disabled = true;
      reset.disabled = true;

      const start = document.getElementById('start') as HTMLButtonElement;
      start.disabled = false;
    }
  };

  timeToString(time: Time): string {
    const laptimeString: string = `${this.renderTime(time.hours)}:
      ${this.renderTime(time.minutes)}:
      ${this.renderTime(time.seconds, true)}`;

    return laptimeString;
  }

  renderTime(time: number, seconds: boolean = false): string {
    let timeString: string = '';
    if (time < 10) {
      timeString += '0';
    }

    seconds ? (timeString += time.toFixed(2)) : (timeString += time.toString());

    return timeString;
  }

  renderState(): boolean {
    let success: boolean = true;
    const currTimeString: string = this.timeToString(this.state.totalTime);
    const laptimeString: string = this.timeToString(this.state.lapTime);

    const laptimeField = document.getElementById('currLaptime');
    laptimeField ? (laptimeField.textContent = '') : (success = false);
    laptimeField?.appendChild(document.createTextNode(laptimeString));

    const currTimeField = document.getElementById('currTime');
    currTimeField ? (currTimeField.textContent = '') : (success = false);
    currTimeField?.appendChild(document.createTextNode(currTimeString));

    return success;
  }

  renderHist(): void {
    const historySection = document.getElementById('laptimeHist');

    // clear list
    historySection?.querySelectorAll('*').forEach((n) => n.remove());

    const list = document.createElement('li');
    list.id = 'histList';

    const history = this.laptimeHist;
    for (let i = 0; i < history.lapNumbers.length; i++) {
      const entry = document.createElement('div');
      const entryHTML = `<span>lap ${history.lapNumbers[i].toString()}:</span>
        <span class="time">${this.timeToString(history.laptimes[i])}</span>`;
      entry.innerHTML = entryHTML;
      list.appendChild(entry);
    }

    historySection?.appendChild(list);
  }

  renderButtons(): JSX.Element {
    if (!this.isManuallyOpperated) {
      if (this.state.finnished)
        return (
          <div id="buttons" className="auto done">
            <p className="connectionStatus">Lap Beacon Connected</p>
            <button
              id="reset"
              className="auto"
              type="button"
              onClick={this.reset}
              onKeyDown={this.reset}
            >
              Reset
            </button>
          </div>
        );
      return (
        <div id="buttons" className="auto running">
          <p className="connectionStatus">Lap Beacon Connected</p>
          <p>Lap Target: {this.props.settings.config.targetLaps} </p>
          <hr />
        </div>
      );
    }
    return (
      <div id="buttons">
        <button
          type="button"
          id="start"
          onClick={this.start}
          onKeyDown={this.start}
        >
          Start
        </button>

        <button
          type="button"
          id="stop"
          onClick={this.stop}
          onKeyDown={this.stop}
        >
          Stop
        </button>

        <button type="button" id="lap" onClick={this.lap} onKeyDown={this.lap}>
          Lap
        </button>

        <button
          id="reset"
          type="button"
          onClick={this.reset}
          onKeyDown={this.reset}
        >
          Reset
        </button>
      </div>
    );
  }

  render(): JSX.Element {
    this.renderState();
    return (
      <div className="laptimeGridContainer">
        <div className="controls">
          <div id="laptimeHeading">Laptime</div>
          {this.renderButtons()}
        </div>

        <div className="laptime">
          <div className="currentTime">
            <span> Total Time: </span>
            <span id="currTime" className="time">
              {' '}
              {}{' '}
            </span>
          </div>
          <div className="currentLap">
            <span> Current Laptime: </span>
            <span id="currLaptime" className="time">
              {' '}
              {}{' '}
            </span>
          </div>

          <hr />

          <div id="laptimeHist">{}</div>
        </div>
      </div>
    );
  }
}

export default LapTimer;
