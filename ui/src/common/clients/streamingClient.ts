import TelemetryPacket from '../models/Telemetry';

export default class StreamingClient {
  private ws: WebSocket;

  connect(handler: (packet: TelemetryPacket) => void): void {
    this.ws = new WebSocket(`ws://${window.location.hostname}:8080/api/stream`);
    this.ws.onmessage = (evt: MessageEvent): void =>
      handler(JSON.parse(evt.data));
  }

  disconnect(): void {
    this.ws.close();
  }
}
