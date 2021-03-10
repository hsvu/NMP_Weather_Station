import React, { createRef } from 'react';

import {
  select,
  extent,
  axisBottom,
  scaleLinear,
  Selection,
  BrushBehavior,
  brushX,
  event,
  ScaleLinear,
  Axis,
} from 'd3';

interface NavBarProps {
  height: number;
  MARGIN: { TOP: number; BOTTOM: number; LEFT: number; RIGHT: number };
  isLive: boolean;
  xValues: Array<number>;
  handleWindowSlide: Function;
  getPointsOnScreenLive(): number;
  setPointsOnScreenLive(count: number): void;
  getPointsPerUnitWidthLive(): number;
}
const svgRef = createRef<SVGSVGElement>();
const TOTAL_POINTS_TO_SHOW_DEFAULT = 200;
const MIN_WIDTH_BRUSH = 50;

export default class NavBar extends React.Component<NavBarProps> {
  private width: number;

  private MARGIN: { TOP: number; BOTTOM: number; LEFT: number; RIGHT: number };

  private height: number;

  private navBarWidth: number;

  private navBarHeight: number;

  private svg: Selection<SVGSVGElement | null, unknown, null, undefined>;

  private parentElement: HTMLElement;

  private brush: BrushBehavior<unknown>;

  private xScale: ScaleLinear<number, number>;

  private xAxis: Axis<number | { valueOf(): number }>;

  private xAxisG: Selection<SVGGElement, unknown, null, undefined>;

  private xValues: Array<number>;

  private isFirst: boolean = true;

  private selection: Array<number>;

  // private selectedRange: number;
  // private pointsOnScreen: number = TOTAL_POINTS_TO_SHOW_DEFAULT;
  private pointsPerSec: number = 0;

  private windowMoving: boolean = false;

  private brushWidth: number = 0;

  private chartWindowExceeded: boolean = false;

  private pointsPerSecPrevious: number = 0;

  constructor(props: NavBarProps) {
    super(props);

    this.MARGIN = props.MARGIN;

    this.height = props.height;
    this.xValues = props.xValues;
    this.getSelection = this.getSelection.bind(this);
    this.addNewPoint = this.addNewPoint.bind(this);
    this.addNewPoints = this.addNewPoints.bind(this);
    this.addNewPointsAndUpdate = this.addNewPointsAndUpdate.bind(this);
    this.getClosestNumberIndex = this.getClosestNumberIndex.bind(this);
    this.setMargin = this.setMargin.bind(this);
  }

  componentDidMount(): void {
    // Get the size of parent container
    const div = document.getElementById('sliding-window');
    this.svg = select(svgRef.current);

    if (div?.parentNode !== undefined) {
      this.setWidth();
      this.navBarWidth = this.width - this.MARGIN.LEFT - this.MARGIN.RIGHT;
      this.navBarHeight = this.height - this.MARGIN.TOP - this.MARGIN.BOTTOM;
      this.svg.attr('width', this.width).attr('height', this.height);
    }

    this.brushWidth = this.navBarWidth;

    this.setXScale();
    this.drawAxis();

    this.setBrush();
    this.svg
      .append('g')
      .attr('id', 'brush')
      .attr('transform', `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`)
      .call(this.brush)
      .call(this.brush.move, [0, this.navBarWidth]);

    this.selection = [0, this.navBarWidth];

    // Add resize event listener
    window.addEventListener('resize', () => {
      this.resize();
    });
  }

  setXScale(): void {
    this.xScale = scaleLinear()
      .domain(extent(this.props.xValues) as Array<number>)
      .nice()
      .range([0, this.navBarWidth]);
  }

  setMargin(newMargin: {
    TOP: number;
    BOTTOM: number;
    LEFT: number;
    RIGHT: number;
  }): void {
    this.MARGIN = newMargin;
  }

  setBrush(): void {
    this.brush = brushX()
      .extent([
        [0, 0],
        [this.navBarWidth, this.navBarHeight],
      ])
      .on('start brush end', () => {
        if (event.sourceEvent) {
          if (event.selection) {
            const indexSelection = event.selection.map(this.xScale.invert);
            this.selection = indexSelection;
            this.pointsPerSecPrevious = this.pointsPerSec;

            const pointsCount =
              this.getClosestNumberIndex(this.xValues, indexSelection[1]) -
              this.getClosestNumberIndex(this.xValues, indexSelection[0]);
            if (pointsCount !== 0) {
              this.props.setPointsOnScreenLive(pointsCount);
            }

            this.props.handleWindowSlide(indexSelection);
          } else {
            // To prevent brush from getting cleared when clicking outside brush area.
            // When a user clicks outside, the whole brush area will be selected.
            select<SVGGElement, number | unknown>('#brush').call(
              this.brush.move,
              [0, this.navBarWidth],
            );
            // const pointsCount = ((this.xValues[this.xValues.length - 1]) - this.xValues[0]) * this.pointsPerSec;
            const pointsCount = this.xValues.length;
            this.props.setPointsOnScreenLive(pointsCount);
          }
        }
      });
  }

  getSelection(): Array<number> {
    return this.selection;
  }

  setWidth(): void {
    const div = document.getElementById('charts');
    if (div?.parentElement !== undefined) {
      this.parentElement = div.parentNode as HTMLElement;
      this.width = this.parentElement.offsetWidth;
    }
  }

  getClosestNumberIndex(array: Array<number>, point: number): number {
    const closestNumber =
      array.reduce(
        (p, n) => (Math.abs(p) > Math.abs(n - point) ? n - point : p),
        Infinity,
      ) + point;
    return this.xValues.indexOf(closestNumber);
  }

  resize(): void {
    // Adjust width
    this.setWidth();
    this.navBarWidth = this.width - this.MARGIN.LEFT - this.MARGIN.RIGHT;

    // Adjust svg width
    this.svg.attr('width', this.width);

    // Redraw colour
    this.svg.select('#colour').remove();

    this.xScale.range([0, this.navBarWidth]).nice();
    this.xAxisG.call(this.xAxis);

    this.svg.selectAll('#brush').remove();
    this.svg
      .append('g')
      .attr('id', 'brush')
      .attr('transform', `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`)
      .call(this.brush)
      .call(this.brush.move, [0, this.navBarWidth]);
  }

  drawAxis(): void {
    this.xAxis = axisBottom(this.xScale);
    this.xAxisG = this.svg
      .append('g')
      .attr('class', 'x-axis-nav')
      .attr(
        'transform',
        `translate(${this.MARGIN.LEFT}, ${this.height - this.MARGIN.BOTTOM})`,
      );
    this.xAxisG.call(this.xAxis);
  }

  updateNavBar(newVal: number): void {
    this.addNewPoint(newVal);

    if (this.isFirst) {
      this.xScale.domain([newVal, newVal + 10]);
      this.isFirst = false;
      this.selection = [newVal, newVal + 10];
    } else {
      this.xScale.domain([this.xValues[0], newVal]);

      // console.log(`xScale domain is: ${this.xScale.domain()}`);
      // console.log(`xScale range is: ${this.xScale.range()}`);

      if (this.xValues.length > TOTAL_POINTS_TO_SHOW_DEFAULT) {
        // Calculate how many points per second you get
        if (this.windowMoving === false) {
          this.windowMoving = true;
          // this.pointsPerSec = Math.round(TOTAL_POINTS_TO_SHOW_DEFAULT / (this.selection[1] - this.selection[0]));
          // if (this.pointsPerSec == 0) {
          //   this.pointsPerSec = 5;
          // } else {
          //   this.pointsPerSecPrevious = this.pointsPerSec;
          // }
          // console.log(`PointsPerSecond now: ${this.pointsPerSec} Selections: ${this.selection[0]}, ${this.selection[1]}`);
        }
        const diff = this.xValues.length - this.props.getPointsOnScreenLive();
        this.selection = [this.xValues[Math.floor(diff)], newVal];
        this.brushWidth =
          (this.xScale(newVal) || 0) -
          (this.xScale(this.xValues[Math.floor(diff)]) || 0);

        if (this.brushWidth < MIN_WIDTH_BRUSH) {
          // If the brush is becoming too small
          // Slide the window
          select<SVGGElement, number | unknown>('#brush').call(
            this.brush.move,
            [
              this.xScale(
                this.xValues[Math.floor(diff) - 100] as number,
              ) as number,
              this.xScale(newVal as number) as number,
            ],
          );
          const pointsToAdd = (this.xValues.length / this.navBarWidth) * 100;
          const startPoint = this.xValues[
            Math.floor(diff) - Math.round(pointsToAdd)
          ];
          this.selection = [startPoint, newVal];
          this.brushWidth += 100;
          // const pointsCount = (newVal - startPoint) * this.pointsPerSec;
          // const pointsCount = this.xValues.length;
          // this.props.setPointsOnScreenLive(pointsCount);
          this.props.setPointsOnScreenLive(
            /* pointsCount */ this.getClosestNumberIndex(this.xValues, newVal) -
              this.getClosestNumberIndex(this.xValues, startPoint),
          );
        } else {
          // Slide the window
          select<SVGGElement, number | unknown>('#brush').call(
            this.brush.move,
            [
              this.xScale(this.xValues[Math.floor(diff)] as number) as number,
              this.xScale(newVal as number) as number,
            ],
          );
        }
      } else {
        this.selection = [this.xValues[0], newVal];
      }
      // console.log(`pointsOnScreen: ${this.props.getPointsOnScreenLive()}`);
      // console.log(`Points Per unit width: ${this.props.getPointsPerUnitWidthLive()}`);
    }

    this.xAxisG.call(this.xAxis);
  }

  addNewPoint(newVal: number): void {
    if (!this.xValues.includes(newVal)) {
      this.xValues.push(newVal);
    }
  }

  addNewPoints(newVals: Array<number>): void {
    for (let i: number = 0; i < newVals.length; i++) {
      this.addNewPoint(newVals[i]);
    }
  }

  addNewPointsAndUpdate(newVals: Array<number>): void {
    this.addNewPoints(newVals);
    this.isFirst = false;
    this.updateNavBar(newVals[newVals.length - 1]);
  }

  pointExists(point: number): boolean {
    return this.xValues.includes(point);
  }

  render(): JSX.Element {
    return <svg id="navBar-svg" ref={svgRef} />;
  }
}
