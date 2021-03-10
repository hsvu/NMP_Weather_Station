import {
  select,
  ScaleLinear,
  scaleLinear,
  extent,
  Line,
  line,
  axisBottom,
  selectAll,
  axisLeft,
  event,
  mouse,
  easeLinear,
  bisector,
  Selection,
  Axis,
  format,
} from 'd3';
import React, { createRef, RefObject } from 'react';
import { InputConfig } from '../../common/models/Config';
import { TelemetrySample } from '../../common/models/Telemetry';

interface ChartPoint {
  x: number;
  y: number;
}

enum CanvasTextAlign {
  start = 'start',
  end = 'end',
  left = 'left',
  center = 'center',
  right = 'right',
}

enum CanvasTextDirection {
  leftToRight = 'ltr',
  rightToLeft = 'rtl',
}

const maxPointsPerUnitWidth = 1;
// const defaultPointsPerUnitWidth = 0.5;

interface Params {
  defaultWidth: number;
  defaultHeight: number;
  MARGIN: { TOP: number; BOTTOM: number; LEFT: number; RIGHT: number };
  data: Array<TelemetrySample>;
  config: InputConfig;
  yAxisText: string;
  isLive: boolean;
  yMax: number;
  hoverEventHandler: Function;
  pointsPerUnitWidth: Function;
  pointsOnScreen: Function;
}

export default class Chart extends React.Component<Params> {
  private MARGIN: { TOP: number; BOTTOM: number; LEFT: number; RIGHT: number };

  private svgRef: React.RefObject<SVGElement>;

  private canvasRef: React.RefObject<HTMLCanvasElement>;

  private canvasToolTipRef: React.RefObject<HTMLCanvasElement>;

  // private bisectPoint: Bisector<ChartPoint, unknown>;

  private bisectPoint = bisector((d: TelemetrySample) => d.time).left;

  private isFirst: boolean = true;

  private svg: Selection<SVGElement | null, {}, null, undefined>;

  private canvasChart: HTMLCanvasElement;

  private canvasToolTip: HTMLCanvasElement;

  private canvasChartContext: CanvasRenderingContext2D;

  private canvasToolTipContext: CanvasRenderingContext2D;

  private width: number;

  private height: number;

  private chartWidth: number;

  private chartHeight: number;

  private parentElement: HTMLElement;

  private xScale: ScaleLinear<number, number>;

  private yScale: ScaleLinear<number, number>;

  private xAxis: Axis<number | { valueOf(): number }>;

  private yAxis: Axis<number | { valueOf(): number }>;

  private xAxisG: Selection<SVGGElement, {}, null, undefined>;

  private yAxisG: Selection<SVGGElement, {}, null, undefined>;

  private chartArea: Selection<SVGGElement, {}, null, undefined>;

  private line: Line<TelemetrySample> = line<TelemetrySample>();

  private axisTextSize: number = 1;

  private yAxisTextSize: number = 2;

  private yDomMax: number = 50;

  private yDomMin: number = 0;

  private limit: number = 40;

  private data: Array<TelemetrySample>;

  private hoverEventHandler: Function;

  private first: boolean = true;

  constructor(props: Params) {
    super(props);

    this.MARGIN = props.MARGIN;

    this.svgRef = createRef();
    this.canvasRef = createRef();
    this.canvasToolTipRef = createRef();
    // this.bisectPoint = bisector((d: ChartPoint) => d.x).left;
    this.data = this.props.data;
    this.hoverEventHandler = this.props.hoverEventHandler;
    this.setXScale = this.setXScale.bind(this);
    this.setYScale = this.setYScale.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.renderChart = this.renderChart.bind(this);
    this.renderYText = this.renderYText.bind(this);
    this.addNewPoint = this.addNewPoint.bind(this);
    this.addNewPoints = this.addNewPoints.bind(this);
    this.resize = this.resize.bind(this);
    this.getChartWidth = this.getChartWidth.bind(this);
    this.setHeight = this.setHeight.bind(this);
    this.addNewPointsAndRender = this.addNewPointsAndRender.bind(this);
    this.showValueAt = this.showValueAt.bind(this);
    this.getConfig = this.getConfig.bind(this);
    this.setMargin = this.setMargin.bind(this);
  }

  componentDidMount(): void {
    const div = document.getElementById(`canvas-chart-${this.props.yAxisText}`);
    this.svg = select(this.svgRef.current);

    if (div?.parentNode !== undefined) {
      this.parentElement = div.parentNode as HTMLElement;
      this.width = this.parentElement.offsetWidth;
      this.height = this.width / 3;

      /**
       * Define Chart Width and Height.
       */
      this.chartWidth = this.width - this.MARGIN.LEFT - this.MARGIN.RIGHT;
      this.chartHeight = this.height - this.MARGIN.TOP - this.MARGIN.BOTTOM;
    }

    this.svg.attr('width', this.width).attr('height', this.height);

    this.chartArea = this.svg
      .append('g')
      .attr('transform', `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);

    /**
     * Define Scales for the Axes.
     * Both scales need a
     *  -> domain (range of possible input values)
     *  -> range (range of available space to map those input values).
     */
    this.setXScale();
    this.setYScale();

    if (this.chartHeight <= 120) {
      this.yAxisTextSize = 1;
      this.axisTextSize = 0.7;
      // this.MARGIN.LEFT = 10;
    }

    /**
     * Render the axes.
     */
    // this.renderXAxis();
    this.renderYAxis();

    /**
     * Render the grids.
     */
    this.renderGrid();

    /**
     * Render Y axis text.
     */
    this.renderYText();

    /**
     * Setup Canvases
     */
    this.canvasChart = select(
      this.canvasRef.current,
    ).node() as HTMLCanvasElement;
    this.canvasToolTip = select(
      this.canvasToolTipRef.current,
    ).node() as HTMLCanvasElement;

    this.setUpCanvases();

    /**
     * Define a line.
     */
    this.line
      .x((d) => this.xScale(d.time) || 0)
      .y((d) => this.yScale(d.value) || 0)
      .context(this.canvasChartContext);

    /**
     *  Capture canvas events
     */

    if (!this.props.isLive) {
      this.attachMouseListener();
    }

    if (!this.props.isLive) {
      this.renderChart();
    }

    window.addEventListener('resize', () => {
      this.resize();
    });
    this.first = false;
  }

  getChartWidth(): number {
    return this.chartWidth;
  }

  setUpCanvases(): void {
    this.canvasChart.width = this.width - this.MARGIN.LEFT - this.MARGIN.RIGHT;
    this.canvasChart.height = this.height;
    this.canvasToolTip.width =
      this.width - this.MARGIN.LEFT - this.MARGIN.RIGHT;
    this.canvasToolTip.height = this.height;

    if (this.first) {
      const canvas = select(this.canvasRef.current).node();
      const canvas2 = select(this.canvasToolTipRef.current).node();
      if (canvas != null && canvas2 != null) {
        this.canvasChartContext = canvas.getContext(
          '2d',
        ) as CanvasRenderingContext2D;
        this.canvasToolTipContext = canvas2.getContext(
          '2d',
        ) as CanvasRenderingContext2D;
      }
    }

    this.canvasChartContext.translate(0, this.MARGIN.TOP);
    this.canvasToolTipContext.translate(0, this.MARGIN.TOP);
  }

  setWidth(): void {
    const div = document.getElementById(`charts`);
    if (div?.parentNode !== undefined) {
      this.parentElement = div.parentNode as HTMLElement;
      this.width = this.parentElement.offsetWidth;
    }
  }

  setXScale(): void {
    this.xScale = scaleLinear()
      .domain(extent(this.props.data.map((d) => d.time)) as Array<number>)
      .nice()
      .range([0, this.chartWidth]);
  }

  setYScale(): void {
    if (this.props.isLive) {
      this.yScale = scaleLinear()
        .domain([0, this.props.yMax])
        .nice()
        .range([this.chartHeight, 0]);
    } else {
      this.yScale = scaleLinear()
        .domain(extent(this.props.data.map((d) => d.value)) as Array<number>)
        .nice()
        .range([this.chartHeight, 0]);
    }
  }

  /**
   * Returns the ChartPoint for the current chart at the given time.
   * If no point for the specified number, return the closest ChartPoint.
   * @param xValue time value.
   */
  getNumber(xValue: number): TelemetrySample {
    let prevX: TelemetrySample = {
      value: 0,
      time: 0,
      channel: this.props.config.channelNumber,
    };
    for (let i: number = 0; i < this.data.length; i++) {
      if (this.data[i].time === xValue) {
        return this.data[i];
      }
      if (this.data[i].time > xValue) {
        return prevX;
      }
      prevX = this.data[i];
    }
    return prevX;
  }

  getConfig(): InputConfig {
    return this.props.config;
  }

  setHeight(newHeight: number): void {
    this.height = newHeight;
    this.chartHeight = this.height - this.MARGIN.TOP - this.MARGIN.BOTTOM;
  }

  setYTextSize(size: number): void {
    this.yAxisTextSize = size;
  }

  getAllNthPoints(n: number): Array<TelemetrySample> {
    const newArray: Array<TelemetrySample> = [];
    for (let i: number = 0; i < this.data.length; i += n) {
      newArray.push(this.data[i]);
    }
    return newArray;
  }

  setMargin(newMargin: {
    TOP: number;
    BOTTOM: number;
    LEFT: number;
    RIGHT: number;
  }): void {
    this.MARGIN = newMargin;
  }

  attachMouseListener(): void {
    const canvasToolTip = select(this.canvasToolTipRef.current);
    canvasToolTip.on('mousemove', () => {
      // Make sure there is data
      if (this.data.length > 0) {
        // Verify that mouse event is on the canvas
        if (
          mouse(event.currentTarget)[1] - this.MARGIN.TOP <
            (this.yScale(this.yScale.domain()[0]) || 0) &&
          mouse(event.currentTarget)[1] - this.MARGIN.TOP >
            (this.yScale(this.yScale.domain()[1]) || 0)
        ) {
          const x = this.xScale.invert(mouse(event.currentTarget)[0]);
          const c: ChartPoint = { x: 0, y: 0 };
          if (x > this.data[this.data.length - 1].time) {
            c.x = this.data[this.data.length - 1].time;
            c.y = this.data[this.data.length - 1].value;
          } else {
            const i: number = this.bisectPoint(this.data, x, 1);
            const d0: TelemetrySample = this.data[i - 1];
            const d1: TelemetrySample = this.data[i];
            const d = Number(x) - d0.time > d1.time - Number(x) ? d1 : d0;
            c.x = d.time;
            c.y = d.value;
          }
          this.props.hoverEventHandler(c.x);
        }
      }
    });

    canvasToolTip.on('mouseleave', () => {
      this.props.hoverEventHandler(null);
    });
  }

  addNewPointsAndRender(
    xRange: Array<number>,
    newPoints: Array<TelemetrySample>,
  ): void {
    for (let i: number = 0; i < newPoints.length; i++) {
      this.addNewPoint(newPoints[i]);
    }
    this.isFirst = false;
    this.updateChart(newPoints[newPoints.length - 1]);
    this.updateChartSlide(xRange, newPoints[newPoints.length - 1]);
  }

  addNewPoints(newPoints: Array<TelemetrySample>): void {
    for (let i: number = 0; i < newPoints.length; i++) {
      this.addNewPoint(newPoints[i]);
    }
  }

  addNewPoint(point: TelemetrySample): void {
    this.adjustYScale(point);
    this.data.push(point);
  }

  adjustYScale(point: TelemetrySample): void {
    if (this.isFirst === true) {
      this.isFirst = false;
      this.yDomMax = point.value + 1;
      this.yDomMin = point.value - 1;
      this.yScale.domain([this.yDomMin, this.yDomMax]).nice();
      this.yAxisG.transition().duration(0).ease(easeLinear).call(this.yAxis);
      this.removeGrid();
      this.renderGrid();
    }

    /**
     * Adjust the y-axis domain.
     *  -> Case 1: newValue.y is lower than the scale domain.
     *  -> Case 2: newValue.y is higher than the scale domain.
     */
    if (point.value < this.yScale.domain()[0]) {
      this.yDomMin = point.value;
      this.yScale.domain([point.value, this.yScale.domain()[1]]).nice();
      this.yAxisG.transition().duration(0).ease(easeLinear).call(this.yAxis);
      this.removeGrid();
      this.renderGrid();
    } else if (point.value > this.yScale.domain()[1]) {
      this.yDomMax = point.value;
      this.yScale.domain([this.yScale.domain()[0], point.value]).nice();
      this.yAxisG.transition().duration(0).ease(easeLinear).call(this.yAxis);
      this.removeGrid();
      this.renderGrid();
    }

    this.yAxisG
      .selectAll('text')
      .style('font-size', `${this.axisTextSize.toString()}em`);
  }

  updateChartSlide(xRange: Array<number>, newValue: TelemetrySample): void {
    this.data.push(newValue);

    if (this.isFirst === true) {
      this.isFirst = false;
      this.yDomMax = newValue.value + 1;
      this.yDomMin = newValue.value - 1;
      this.yScale.domain([this.yDomMin, this.yDomMax]).nice();
      this.yAxisG.transition().duration(0).ease(easeLinear).call(this.yAxis);
      this.removeGrid();
      this.renderGrid();
    }

    this.adjustYScale(newValue);

    // Adjust and redraw the xAxis
    this.xScale.domain([xRange[0], xRange[1]]);
    // this.xAxisG.call(this.xAxis);

    // Redraw the canvas
    this.renderChart();
  }

  updateChart(newValue: TelemetrySample): void {
    this.addNewPoint(newValue);
    // const difference = this.xScale.domain()[1] - this.xScale.domain()[0];

    if (this.isFirst === true) {
      this.isFirst = false;
      this.yDomMax = newValue.value + 1;
      this.yDomMin = newValue.value - 1;
      this.yScale.domain([this.yDomMin, this.yDomMax]).nice();
      this.yAxisG.transition().duration(0).ease(easeLinear).call(this.yAxis);
      this.removeGrid();
      this.renderGrid();
    }
    /**
     * Adjust the y-axis domain.
     *  -> Case 1: newValue.y is lower than the scale domain.
     *  -> Case 2: newValue.y is higher than the scale domain.
     */
    if (newValue.value < this.yScale.domain()[0]) {
      this.yDomMin = newValue.value;
      this.yScale.domain([newValue.value, this.yScale.domain()[1]]).nice();
      this.yAxisG.transition().duration(0).ease(easeLinear).call(this.yAxis);
      this.removeGrid();
      this.renderGrid();
    } else if (newValue.value > this.yScale.domain()[1]) {
      this.yDomMax = newValue.value;
      this.yScale.domain([this.yScale.domain()[0], newValue.value]).nice();
      this.yAxisG.transition().duration(0).ease(easeLinear).call(this.yAxis);
      this.removeGrid();
      this.renderGrid();
    }

    this.xScale.domain([newValue.time - (this.limit - 2), newValue.time]);
    // this.xAxisG.call(this.xAxis);

    this.renderChart();
  }

  writeText(
    x: number,
    y: number,
    textAlign: CanvasTextAlign,
    textDirection: CanvasTextDirection,
  ): void {
    this.canvasToolTipContext.font = '12px Sans-Serif';
    this.canvasToolTipContext.lineWidth = 1.4;
    this.canvasToolTipContext.textAlign = textAlign;
    this.canvasToolTipContext.direction = textDirection;
    this.canvasToolTipContext.fillStyle = 'black';
    this.canvasToolTipContext.strokeStyle = 'white';
    this.canvasToolTipContext.fillText(
      `${this.props.yAxisText}: ${this.yScale.invert(y).toFixed(2)}`,
      x,
      y,
    );
    this.canvasToolTipContext.strokeText(
      `${this.props.yAxisText}: ${this.yScale.invert(y).toFixed(2)}`,
      x,
      y,
    );
    this.canvasToolTipContext.fillText(
      `Time: ${Number(this.xScale.invert(Number(x))).toFixed(2)}`,
      x,
      y + 15,
    );
    this.canvasToolTipContext.strokeText(
      `Time: ${Number(this.xScale.invert(Number(x))).toFixed(2)}`,
      x,
      y + 15,
    );
  }

  removeToolTip(): void {
    this.canvasToolTipContext.setTransform(1, 0, 0, 1, 0, 0);
    this.canvasToolTipContext.clearRect(0, 0, this.width, this.height);
    this.canvasToolTipContext.restore();
    this.canvasToolTipContext.translate(0, this.MARGIN.TOP);
  }

  removeGrid(): void {
    this.svg.selectAll('.grid').remove();
  }

  slideChart(xRange: Array<number>): void {
    // Adjust and redraw the xAxis
    this.xScale.domain([xRange[0], xRange[1]]);
    // this.xAxisG.call(this.xAxis);

    // Redraw the canvas
    this.renderChart();
  }

  removeMouseListener(): void {
    const canvasToolTip = select(this.canvasToolTipRef.current);
    canvasToolTip.on('mousemove', () => {});
    canvasToolTip.on('mouseleve', () => {});
  }

  resize(): void {
    this.setWidth();
    this.svg.attr('width', this.width);
    this.svg.attr('height', this.height);
    this.chartWidth = this.width - this.MARGIN.LEFT - this.MARGIN.RIGHT;
    this.xScale.range([0, this.chartWidth]);
    this.yScale.range([this.chartHeight, 0]);

    selectAll('.x-axis').attr(
      'transform',
      `translate(${this.MARGIN.LEFT}, ${this.height - this.MARGIN.BOTTOM})`,
    );
    this.yAxisG.call(this.yAxis);
    this.removeGrid();
    this.renderGrid();

    // Adjust size of y-axis text
    if (this.chartHeight <= 120) {
      this.axisTextSize = 0.7;
      // this.MARGIN.LEFT = 40;
    } else {
      this.axisTextSize = 1;
    }

    this.setUpCanvases();
    this.renderChart();

    this.svg.select('.yAxisText').remove();
    this.renderYText();

    this.svg
      .selectAll('.legend')
      .selectAll('text')
      .style('font-size', `${this.axisTextSize.toString()}em`);
  }

  showValueAt(time: number): void {
    this.props.hoverEventHandler(time);
  }

  renderChart(): void {
    // Save the canvas state (like translate)
    this.canvasChartContext.save();

    // clear canvas
    this.canvasChartContext.setTransform(1, 0, 0, 1, 0, 0);
    this.canvasChartContext.clearRect(0, 0, this.width, this.height);

    // Restore canvas state
    this.canvasChartContext.restore();

    // Draw on the canvas
    if (this.props.pointsPerUnitWidth() > maxPointsPerUnitWidth) {
      // Instead of showing all the points, only show every n-point
      const n = Math.ceil(this.props.pointsOnScreen() / (this.chartWidth / 2));
      this.canvasChartContext.fillStyle = '#fff';
      this.canvasChartContext.strokeStyle = '#1abeed';
      this.canvasChartContext.beginPath();
      this.line(this.getAllNthPoints(n));
      this.canvasChartContext.lineWidth = 1.5;

      this.canvasChartContext.stroke();

      this.canvasChartContext.closePath();
    } else {
      this.canvasChartContext.strokeStyle = '#1abeed';
      this.canvasChartContext.fillStyle = '#fff';
      this.canvasChartContext.beginPath();
      this.line(this.data);
      this.canvasChartContext.lineWidth = 1.5;

      this.canvasChartContext.stroke();

      this.canvasChartContext.closePath();
    }
  }

  renderToolTip(x: number): void {
    const point = this.getNumber(Number(x));
    const newX = this.xScale(point.time) || 0;
    const newY = this.yScale(point.value) || 0;

    // clear canvas
    // let w = Number(newX) + 10;
    this.canvasToolTipContext.setTransform(1, 0, 0, 1, 0, 0);
    this.canvasToolTipContext.clearRect(0, 0, this.width, this.height);
    this.canvasToolTipContext.restore();
    this.canvasToolTipContext.translate(0, this.MARGIN.TOP);

    // Draw the tooltip circle
    this.canvasToolTipContext.beginPath();
    this.canvasToolTipContext.arc(newX, newY, 5, 0, 2 * Math.PI, false);
    this.canvasToolTipContext.fillStyle = 'green';
    this.canvasToolTipContext.fill();
    this.canvasToolTipContext.stroke();

    // Draw the tooltip vertical line
    this.canvasToolTipContext.strokeStyle = 'green ';
    this.canvasToolTipContext.moveTo(newX, newY);
    this.canvasToolTipContext.lineTo(
      newX,
      this.yScale(this.yScale.domain()[0]) || 0,
    );
    this.canvasToolTipContext.stroke();

    // Draw the tooltip text

    if ((this.xScale ? this.xScale.domain()[1] - newX : '') < 120) {
      this.writeText(
        newX - 10,
        newY,
        CanvasTextAlign.right,
        CanvasTextDirection.rightToLeft,
      );
    } else {
      this.writeText(
        newX + 10,
        newY,
        CanvasTextAlign.left,
        CanvasTextDirection.leftToRight,
      );
    }
  }

  renderYText(): void {
    this.svg
      .append('g')
      .attr('class', 'legend')
      .append('text')
      .attr(
        'transform',
        () =>
          `translate(${15}, ${
            (this.chartHeight + this.MARGIN.TOP + this.MARGIN.BOTTOM) / 2
          }) rotate(-90)`,
      )
      .style('text-anchor', 'middle')
      .attr('class', 'yAxisText')
      .text(this.props.yAxisText);

    this.svg
      .selectAll('.yAxisText')
      .selectAll('text')
      .style('font-size', `${this.axisTextSize.toString()}em`);
  }

  renderGrid(): void {
    this.chartArea
      .append('g')
      .attr('class', 'grid')
      .call(
        axisLeft(this.yScale)
          .tickSize(-this.chartWidth)
          .tickFormat((domain, number) => ''),
      );
  }

  renderYAxis(): void {
    this.yAxis = axisLeft(this.yScale).ticks(5).tickFormat(format('.1s'));
    this.yAxisG = this.svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);
    this.yAxisG.call(this.yAxis);

    this.yAxisG
      .selectAll('text')
      .style('font-size', `${this.axisTextSize.toString()}em`);
  }

  renderXAxis(): void {
    this.xAxis = axisBottom(this.xScale);
    this.xAxisG = this.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr(
        'transform',
        `translate(${this.MARGIN.LEFT}, ${this.height - this.MARGIN.BOTTOM})`,
      );
    this.xAxisG.call(this.xAxis);
  }

  render(): JSX.Element {
    const options = {
      gridColumn: 1,
      gridRow: 1,
    };

    const options2 = {
      gridColumn: 1,
      gridRow: 1,
      marginLeft: this.MARGIN.LEFT,
    };

    return (
      <div
        id={`canvas-chart-${this.props.yAxisText}`}
        style={{ display: 'grid' }}
      >
        <svg
          style={options}
          ref={this.svgRef as RefObject<SVGSVGElement>}
          width={this.props.defaultWidth}
          height={this.props.defaultHeight}
        />
        <canvas
          ref={this.canvasRef as RefObject<HTMLCanvasElement>}
          style={options2}
          width={this.props.defaultWidth - this.MARGIN.LEFT - this.MARGIN.RIGHT}
          height={this.props.defaultHeight}
        />
        <canvas
          ref={this.canvasToolTipRef as RefObject<HTMLCanvasElement>}
          style={options2}
          width={this.props.defaultWidth - this.MARGIN.LEFT - this.MARGIN.RIGHT}
          height={this.props.defaultHeight}
        />
      </div>
    );
  }
}
