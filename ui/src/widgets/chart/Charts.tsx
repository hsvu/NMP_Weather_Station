import React, { createRef, CSSProperties } from 'react';
import { BaseType, Selection } from 'd3';
import { Row } from 'react-bootstrap';
import IWidget from '../../common/models/IWidget';
import Widget from '../../common/models/Widget';
import WidgetProps from '../../common/models/WidgetProps';
import ChartsConfig from './ChartsConfig';
import IWidgetSettingsComponent, {
  WidgetSettingsProps,
} from '../../common/models/IWidgetSettingsComponent';
import './Style.css';
import { TelemetrySample } from '../../common/models/Telemetry';
import Chart from './CanvasChart';
import ChartsSettings from './ChartSettings';
import NavBar from './ChartNav';

const MARGIN = { TOP: 5, BOTTOM: 4, LEFT: 50, RIGHT: 5 };
const slidingDivHeight = 50;
const maxDataVal = 50;
const TOTAL_POINTS_LIVE_ON_SCREEN_DEFAULT = 200;

const navBarRef = createRef<NavBar>();
const minChartHeight = 120;

interface State {
  width: number;
  charts: number;
}

const navBarHeight = 50;
const defaultHeight = 300;

export default class Charts
  extends Widget<ChartsConfig, State>
  implements IWidget {
  static widgetId = 'bf35510d-56ea-42d3-a9e4-096d486969ee';

  static widgetName = 'Charts';

  private numCharts: number = 0;

  private chartRefs: Array<React.RefObject<Chart>> = [];

  private isLive: boolean;

  private width: number;

  private height: number;

  private checkBox: Selection<BaseType, unknown, HTMLElement, unknown>;

  private checkStatus: boolean = false;

  private pointsOnScreenLive: number = TOTAL_POINTS_LIVE_ON_SCREEN_DEFAULT;

  private pointsPerUnitWidthLive: number = 0;

  private chartWidgetElements: Array<JSX.Element> = [];

  constructor(props: WidgetProps<ChartsConfig>) {
    super(props);

    // Boolean const to check whether generated chart should be live or static
    // If data array passed is empty, it is a live chart else static
    if (props.data !== undefined) {
      this.isLive = Object.keys(props.data).length === 0;
    }

    // Setup default values
    this.height = defaultHeight;
    this.width = window.innerWidth;
    this.state = {
      width: this.width,
      charts: this.props.settings.config.channels.length,
    };

    // Bind methods
    this.update = this.update.bind(this);
    this.saveDataPoint = this.saveDataPoint.bind(this);
    this.hoverEventHandler = this.hoverEventHandler.bind(this);
    this.attachMouseListener = this.attachMouseListener.bind(this);
    this.removeMouseListener = this.removeMouseListener.bind(this);
    this.handleWindowSlide = this.handleWindowSlide.bind(this);
    this.getPointsOnScreenLive = this.getPointsOnScreenLive.bind(this);
    this.setPointsOnScreenLive = this.setPointsOnScreenLive.bind(this);
    this.getPointsPerUnitWidthLive = this.getPointsPerUnitWidthLive.bind(this);
    this.setupCharts = this.setupCharts.bind(this);
  }

  static create(
    ref: React.RefObject<Charts>,
    props: WidgetProps<ChartsConfig>,
  ): React.ReactElement<IWidget> | null {
    return <Charts {...props} ref={ref} />;
  }

  static settingsComponent(
    ref: React.RefObject<ChartsSettings>,
    props: WidgetSettingsProps<ChartsConfig>,
  ): React.ReactElement<IWidgetSettingsComponent> {
    return <ChartsSettings {...props} ref={ref} />;
  }

  setupCharts(): void {
    for (const channel of this.props.settings.config.channels) {
      const config = this.props.config.inputs.find(
        (inputConfig) => inputConfig.channelNumber === channel,
      );

      if (config) {
        // How many charts to create.
        const ref = React.createRef<Chart>();
        let data: Array<TelemetrySample> = [];
        if (this.props.data !== undefined) {
          data = this.props.data[config.channelNumber];
          if (data === undefined) {
            data = [];
          }
        }
        this.chartWidgetElements.push(
          <Chart
            key={config.channelNumber}
            ref={ref}
            defaultWidth={this.state.width}
            defaultHeight={this.height}
            MARGIN={MARGIN}
            data={data}
            yAxisText={config.channelName}
            config={config}
            isLive={this.isLive}
            yMax={maxDataVal}
            hoverEventHandler={this.hoverEventHandler}
            pointsPerUnitWidth={this.getPointsPerUnitWidthLive}
            pointsOnScreen={this.getPointsOnScreenLive}
          />,
        );
        this.chartRefs.push(ref);
      }
    }
  }

  componentDidMount(): void {
    if (this.numCharts !== 0) {
      /** Get height and width of the parent div */
      const height = this.calculateHeight();

      this.pointsPerUnitWidthLive =
        this.pointsOnScreenLive /
        (this.chartRefs[0].current?.getChartWidth() as number);

      if (height != null) {
        const totalCharts = this.numCharts;
        let yTextSize = 12;
        let heightForEachChart: number =
          (height - slidingDivHeight - 20) / totalCharts;
        if (heightForEachChart < minChartHeight) {
          heightForEachChart = minChartHeight;
          yTextSize = 10;
        }
        for (const ref of this.chartRefs) {
          const component = ref.current;
          if (component) {
            component.setHeight(heightForEachChart);
            component.setYTextSize(yTextSize);
            component.resize();
          }
        }
      }
    }
  }

  getParentContainerHeight(): number {
    const div = document.getElementById('charts');
    let height = -1;
    if (div?.parentNode !== undefined) {
      const parentElement = div.parentNode as HTMLElement;
      height = parentElement.offsetHeight;
    }
    return height;
  }

  getParentContainerWidth(): number {
    const div = document.getElementById('charts');
    let width = -1;
    if (div?.parentNode !== undefined) {
      const parentElement = div.parentNode as HTMLElement;
      width = parentElement.offsetWidth;
    }
    return width;
  }

  calculateHeight(): number {
    const chartsDiv = document.getElementById('charts-row');
    const parentDiv = chartsDiv?.parentNode?.parentNode as HTMLElement;

    const parentHeight = parentDiv.offsetHeight;

    // Get height taken by charts
    const chartsHeight = (chartsDiv as HTMLElement).offsetHeight;

    // Calculate height taken by other widgets
    const otherWidgetsHeight = parentHeight - chartsHeight;

    // Caculate height for charts
    const newHeightForCharts = window.innerHeight - otherWidgetsHeight;

    // 100 to account for bottom and top menus
    return newHeightForCharts - 100;
  }

  shouldComponentUpdate(): boolean {
    return true;
  }

  componentDidUpdate(): void {
    if (this.numCharts !== 0) {
      this.pointsPerUnitWidthLive =
        this.pointsOnScreenLive /
        (this.chartRefs[0].current?.getChartWidth() as number);
      const height = this.calculateHeight();
      if (height != null) {
        const totalCharts = this.numCharts;
        let yTextSize = 12;
        let heightForEachChart: number =
          (height - slidingDivHeight - 20) / totalCharts;
        if (heightForEachChart < minChartHeight) {
          heightForEachChart = minChartHeight;
          yTextSize = 10;
        }
        for (const ref of this.chartRefs) {
          const component = ref.current;
          if (component) {
            component.setHeight(heightForEachChart);
            component.setYTextSize(yTextSize);
            component.resize();
          }
        }
      }
    }
  }

  setPointsOnScreenLive(count: number): void {
    this.pointsOnScreenLive = count;
    this.pointsPerUnitWidthLive =
      this.pointsOnScreenLive /
      (this.chartRefs[0].current?.getChartWidth() as number);
  }

  getPointsPerUnitWidthLive(): number {
    return this.pointsPerUnitWidthLive;
  }

  getPointsOnScreenLive(): number {
    return this.pointsOnScreenLive;
  }

  /**
   * Handle the hover event for all the charts.
   * @param d ChartPoint Object.
   */
  hoverEventHandler(time: number | null): void {
    for (const ref of this.chartRefs) {
      const c = ref.current;
      if (time == null) {
        if (c != null) {
          c.removeToolTip();
        }
      } else if (c != null) {
        c.renderToolTip(time);
      }
    }
    if (time && this.props.hoverEventHandler)
      this.props.hoverEventHandler(time);
  }

  handleWindowSlide(indexSelection: Array<number>): void {
    for (const ref of this.chartRefs) {
      const c = ref.current;

      if (c != null) {
        c.slideChart(indexSelection);
      }
    }
  }

  update(data: { [channel: number]: TelemetrySample }): void {
    if (this.checkStatus) {
      this.checkStatus = false;
      this.removeMouseListener();
    }
    for (const ref of this.chartRefs) {
      const chart = ref.current;
      const navBar = navBarRef.current;
      if (chart) {
        const dataSample = data[chart.getConfig().channelNumber];
        if (dataSample) {
          if (this.checkStatus === false) {
            navBar?.updateNavBar(dataSample.time);
            chart.updateChart(dataSample);
            chart.updateChartSlide(
              navBar?.getSelection() as Array<number>,
              dataSample,
            );
          } else {
            chart.addNewPoint(dataSample);
            navBar?.addNewPoint(dataSample.time);
          }
        }
      }
    }
  }

  saveDataPoint(data: { [channel: number]: TelemetrySample }): void {
    if (!this.checkStatus) {
      this.checkStatus = true;
      this.attachMouseListener();
    }

    for (const ref of this.chartRefs) {
      const chart = ref.current;
      const navbar = navBarRef.current;
      if (chart) {
        const dataSample = data[chart.getConfig().channelNumber];
        if (dataSample !== undefined) {
          chart?.addNewPoint(dataSample);
          navbar?.addNewPoint(dataSample.time);
        }
      }
    }
  }

  attachMouseListener(): void {
    if (this.checkStatus) {
      for (const ref of this.chartRefs) {
        const chart = ref.current;
        if (chart != null) {
          chart.attachMouseListener();
        }
      }
    }
  }

  removeMouseListener(): void {
    for (const ref of this.chartRefs) {
      const chart = ref.current;
      if (chart != null) {
        chart.removeMouseListener();
      }
    }
  }

  showValueAt(time: number): void {
    for (const ref of this.chartRefs) {
      ref.current?.showValueAt(time);
    }
  }

  // Update heights.
  render(): JSX.Element {
    const slidingOptions = {
      opacity: 1,
      backgroundColor: 'rgb(23, 23, 23)',
      position: 'sticky',
      width: '100%',
      bottom: 0,
      height: `${slidingDivHeight.toString()}px`,
    };

    this.chartRefs = [];
    this.chartWidgetElements = [];
    this.setupCharts();
    this.numCharts = this.chartRefs.length;

    const navBarMargin = {
      TOP: 10,
      BOTTOM: 20,
      LEFT: MARGIN.LEFT,
      RIGHT: MARGIN.RIGHT,
    };
    let xValues: number[] = [];
    if (this.props.data !== undefined) {
      const channel = this.props.settings.config.channels[0];
      if (channel !== undefined && this.props.data[channel] !== undefined) {
        xValues = this.props.data[channel].map((input) => input.time);
      }
    }
    return (
      <Row id="charts-row" style={{ padding: '5px 0px 5px 0px' }}>
        <div id="charts">
          {this.numCharts > 0 ? (
            <>
              {this.chartWidgetElements}
              <div id="sliding-window" style={slidingOptions as CSSProperties}>
                <NavBar
                  key={`${'Charts-Navbar'} nav`}
                  ref={navBarRef}
                  height={navBarHeight}
                  MARGIN={navBarMargin}
                  isLive={this.isLive}
                  xValues={xValues}
                  handleWindowSlide={this.handleWindowSlide}
                  getPointsOnScreenLive={this.getPointsOnScreenLive}
                  setPointsOnScreenLive={this.setPointsOnScreenLive}
                  getPointsPerUnitWidthLive={this.getPointsPerUnitWidthLive}
                />
              </div>
            </>
          ) : (
            <h2 id="error-msg"> Charts not Configured </h2>
          )}
        </div>
      </Row>
    );
  }
}
