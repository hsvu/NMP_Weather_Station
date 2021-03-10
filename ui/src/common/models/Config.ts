export default interface Config {
  inputs: InputConfig[];
  outputs: OutputsConfig;
}

export interface InputConfig {
  channelName: string;
  channelNumber: number;
  units: string;
  conversion?: Conversion[];
  ranges?: RangeConfig[];
}

export interface Conversion {
  x: number;
  y: number;
}

export interface RangeConfig {
  low: number;
  high: number;
  colour: string;
}

export interface OutputsConfig {
  live: number[];
}
