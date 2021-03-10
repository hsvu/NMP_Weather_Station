import ChartPoint from './ChartPoint';

export default interface ChartSetup {
  data: Array<ChartPoint>;
  yAxisText: string;
  unit: string;
}
