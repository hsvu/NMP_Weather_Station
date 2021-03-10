interface TelemetryPacket {
  data: { [channel: number]: TelemetrySample };
}

export interface TelemetrySample {
  channel: number;
  value: number;
  time: number;
  diag?: boolean;
  warn?: boolean;
}

export interface LogSample {
  channelnum: number;
  value: number;
  time: number;
  diag?: boolean;
  warn?: boolean;
}

export default TelemetryPacket;
