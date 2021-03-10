import React from 'react';
import { Subscription } from 'rxjs';
import { Spinner, Button } from 'react-bootstrap';
import LiveTab from './tab/Tab';
import SettingsModal from './settings/SettingsModal';
import TelemetryPacket from '../common/models/Telemetry';
import Clients from '../common/clients/clients';
import optionBarStyles from '../common/styles/OptionBar.module.css';
import buttonStyles from '../common/styles/Button.module.css';

interface Props {
  clients: Clients;
}

export interface State {
  isConnected: boolean;
  isPaused: boolean;
  tabId?: string;
  tabRef: React.RefObject<LiveTab>;
  showSettings: boolean;
}

class Live extends React.Component<Props, State> {
  carSubscription: Subscription;

  dataSourceSub: Subscription;

  constructor(props: Props) {
    super(props);

    this.connectToStream = this.connectToStream.bind(this);
    this.disconnectFromStream = this.disconnectFromStream.bind(this);
    this.updateConfig = this.updateConfig.bind(this);

    let tabId = props.clients.dashboards.getDefaultTabId();

    let showSettings = false;

    if (!tabId) {
      tabId = props.clients.dashboards.addTab();
      showSettings = true;
    }

    this.state = {
      isConnected: false,
      isPaused: false,
      tabId,
      tabRef: React.createRef<LiveTab>(),
      showSettings,
    };
  }

  /**
   * Runs when a new packet is received
   * @param evt
   */
  onData(packet: TelemetryPacket): void {
    if (this.state.tabRef.current)
      this.state.tabRef.current.update(packet, this.state.isPaused);
  }

  onTabDelete(): void {
    this.setState((state) => ({
      tabId: this.props.clients.dashboards.getDefaultTabId() || '',
      showSettings: false,
    }));
  }

  changeTab(tabId: string): void {
    this.setState({
      tabId,
      tabRef: React.createRef<LiveTab>(),
    });
  }

  addTab(): void {
    this.setState((state) => ({
      tabId: this.props.clients.dashboards.addTab(),
      showSettings: true,
    }));
  }

  updateConfig(): void {
    this.setState({});
  }

  async connectToStream(): Promise<void> {
    this.props.clients.streaming.connect(this.onData.bind(this));

    this.setState({
      isConnected: true,
    });
  }

  disconnectFromStream(): void {
    this.props.clients.streaming.disconnect();

    this.setState({
      isConnected: false,
    });
  }

  render(): JSX.Element {
    if (!this.state.tabId) {
      return (
        <>
          <h2>Please add a tab</h2>
        </>
      );
    }

    const currentTabId = this.state.tabId;
    const showTabSettings = this.state.showSettings;
    const tabs = this.props.clients.dashboards.getTabs();
    const canDelete = tabs.length > 1;

    // Setup elements
    const tabOptions: JSX.Element[] = [];
    let button: JSX.Element;
    let pauseBtn: JSX.Element = <></>;

    // Add tab options

    tabs.forEach(([tabId, tabConfig]) => {
      tabOptions.push(
        <li key={tabId} className={optionBarStyles.item}>
          <Button
            type="button"
            className={`${buttonStyles.inline} ${buttonStyles.bar} ${
              tabId === currentTabId ? buttonStyles.active : null
            }`}
            key={tabConfig.name}
            onClick={(event): void => this.changeTab(tabId)}
          >
            {tabConfig.name}
          </Button>
        </li>,
      );
    });

    // Connect and disconnect button for telemetry websocket stream
    if (this.state.isConnected)
      button = (
        <Button
          key="connect"
          onClick={this.disconnectFromStream}
          title="Disconnect from telemetry data stream"
        >
          <Spinner size="sm" animation="grow" />
          Disconnect from Stream
        </Button>
      );
    else
      button = (
        <Button
          className={`${buttonStyles.inline} ${buttonStyles.bar}`}
          key="disconnect"
          onClick={this.connectToStream}
          variant="outline-light"
          title="Connect to telemetry data stream"
        >
          Connect To Stream
        </Button>
      );

    // Pause and Continue button when connected to live stream
    if (this.state.isConnected && !this.state.isPaused)
      pauseBtn = (
        <Button
          type="button"
          className={`${buttonStyles.inline} ${buttonStyles.bar}`}
          onClick={(): void =>
            this.setState({
              isPaused: true,
            })
          }
        >
          Pause
        </Button>
      );
    else if (this.state.isConnected && this.state.isPaused)
      pauseBtn = (
        <Button
          type="button"
          className={`${buttonStyles.inline} ${buttonStyles.bar}`}
          onClick={(): void =>
            this.setState({
              isPaused: false,
            })
          }
        >
          Resume
        </Button>
      );

    return (
      <>
        <LiveTab
          key={currentTabId}
          ref={this.state.tabRef}
          tabConfig={this.props.clients.dashboards.getTab(currentTabId)}
          clients={this.props.clients}
        />
        <div className={`${optionBarStyles.bar} ${optionBarStyles.live}`}>
          <div
            className={`${optionBarStyles.wrapper} ${optionBarStyles.live_wrapper_scaling}`}
          >
            {tabOptions}
            <li className={optionBarStyles.item}>
              <Button
                type="button"
                className={`${buttonStyles.inline} ${buttonStyles.bar}`}
                key="new-tab"
                onClick={(event): void => this.addTab()}
              >
                +
              </Button>
            </li>
            <li className={optionBarStyles.itemSplit}>{button}</li>
            <li>{pauseBtn}</li>
            <li>
              <SettingsModal
                show={showTabSettings}
                key={`tab-settings-${currentTabId}`}
                clients={this.props.clients}
                tabId={currentTabId}
                tabConfig={this.props.clients.dashboards.getTab(currentTabId)}
                updateConfig={this.updateConfig}
                canDelete={canDelete}
                onDelete={(): void => this.onTabDelete()}
              />
            </li>
          </div>
        </div>
      </>
    );
  }
}

export default Live;
