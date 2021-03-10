import ConfigsClient from './ConfigsClient';
import DashboardsClient from './dashboardsClient';
import StreamingClient from './streamingClient';
import WeatherClient from './weatherClient';

export default class Clients {
  weather: WeatherClient;

  dashboards: DashboardsClient;

  configs: ConfigsClient;

  streaming: StreamingClient;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
      this.weather = new WeatherClient(baseUrl);
    } else {
      const baseUrl = `http://localhost`;
      this.weather = new WeatherClient(`${baseUrl}:8000`);
    }

    this.dashboards = new DashboardsClient();
    this.configs = new ConfigsClient();
    this.streaming = new StreamingClient();
  }
}
