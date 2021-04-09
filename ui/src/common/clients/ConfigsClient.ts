import Config from '../models/Config';

const defaultConfig: Config = {
  inputs: [
    {
      channelName: 'Ambient Temperature',
      channelNumber: 1567,
      units: 'Degrees',
    },
    {
      channelName: 'Track Temperature',
      channelNumber: 1568,
      units: 'Degrees',
    },
    {
      channelName: 'Humidity',
      channelNumber: 1569,
      units: 'Percentage',
    },
    {
      channelName: 'Precipitation',
      channelNumber: 1570,
      units: 'mm',
    },
    {
      channelName: 'Wind Speed',
      channelNumber: 1571,
      units: 'kmph',
    },
    {
      channelName: 'Wind Direction',
      channelNumber: 1572,
      units: 'Degrees',
    },
  ],
  outputs: {
    live: [1567, 1568, 1569, 1570, 1571, 1572],
  },
};

export default class ConfigsClient {
  getConfig(): Config {
    return defaultConfig;
  }
}
