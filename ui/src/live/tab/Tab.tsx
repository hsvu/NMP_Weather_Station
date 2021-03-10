import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Clients from '../../common/clients/clients';
import IWidget from '../../common/models/IWidget';
import Charts from '../../widgets/chart/Charts';
import widgets from '../../widgets/widgets';
import WidgetPanelStyle from '../../common/styles/WidgetPanel.module.css';
import TelemetryPacket, {
  TelemetrySample,
} from '../../common/models/Telemetry';
import TabConfig from '../../common/models/TabConfig';

interface Props {
  tabConfig: TabConfig;
  clients: Clients;
}

interface State {}

class LiveTab extends React.Component<Props, State> {
  widgetRefs: React.RefObject<IWidget>[] = [];

  chartsRef: React.RefObject<IWidget>;

  cache?: { [channel: number]: TelemetrySample[] };

  constructor(props: Props) {
    super(props);

    this.hoverEventHandler = this.hoverEventHandler.bind(this);
    this.update = this.update.bind(this);
  }

  update(packet: TelemetryPacket, isPaused: boolean): void {
    for (const widget of this.widgetRefs) {
      if (!isPaused) widget.current?.update(packet.data);
      else widget.current?.saveDataPoint(packet.data);
    }
  }

  /**
   * Runs when hovering over a chart point
   * @param time Time of the point that is hovered over
   */
  hoverEventHandler(time: number): void {
    for (const widget of this.widgetRefs) {
      // Don't call Hover on charts to prevent recursion.
      // Since charts are the source of hover.
      if (widget !== this.chartsRef) widget.current?.showValueAt(time);
    }
  }

  render(): JSX.Element {
    const leftColumnWidgets: JSX.Element[] = [];
    const rightColumnWidgets: JSX.Element[] = [];

    // Add Widgets
    this.props.tabConfig.widgets[0].forEach((widgetTabConfig, index) => {
      const Widget = widgets[widgetTabConfig.widgetId];
      const ref = React.createRef<IWidget>();

      let hoverHandler: ((time: number) => void) | undefined;

      // If the widget is a chart, assign hover function
      if (widgetTabConfig.widgetId === Charts.widgetId) {
        hoverHandler = this.hoverEventHandler;
        this.chartsRef = ref;
      }

      this.widgetRefs.push(ref);
      leftColumnWidgets.push(
        <Col
          key={widgetTabConfig.widgetId}
          sm={widgetTabConfig.settings.mobileWidth}
          md={widgetTabConfig.settings.width}
        >
          {Widget.create(ref, {
            settings: widgetTabConfig.settings,
            data: {},
            hoverEventHandler: hoverHandler,
            config: this.props.clients.configs.getConfig(),
          })}
        </Col>,
      );
    });

    this.props.tabConfig.widgets[1].forEach((widgetTabConfig, index) => {
      const Widget = widgets[widgetTabConfig.widgetId];
      if (!Widget) return;
      const ref = React.createRef<IWidget>();
      this.widgetRefs.push(ref);

      let hoverHandler: ((time: number) => void) | undefined;

      // If the widget is a chart, assign hover function
      if (widgetTabConfig.widgetId === Charts.widgetId) {
        hoverHandler = this.hoverEventHandler;
        this.chartsRef = ref;
      }

      rightColumnWidgets.push(
        <Col
          key={widgetTabConfig.widgetId}
          sm={widgetTabConfig.settings.mobileWidth}
          md={widgetTabConfig.settings.width}
        >
          {Widget.create(ref, {
            settings: widgetTabConfig.settings,
            data: {},
            hoverEventHandler: hoverHandler,
            config: this.props.clients.configs.getConfig(),
          })}
        </Col>,
      );
    });

    return (
      <>
        <Container fluid>
          <Row style={{ margin: '0' }} key="right">
            <Col md={6} className={WidgetPanelStyle.column_scroll}>
              <Row>{leftColumnWidgets}</Row>
            </Col>
            <Col md={6} className={WidgetPanelStyle.column_scroll}>
              <Row>{rightColumnWidgets}</Row>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default LiveTab;
