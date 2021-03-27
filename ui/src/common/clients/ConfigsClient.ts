import Config from '../models/Config';

const defaultConfig: Config = {
  inputs: [
    {
      channelName: 'Gear',
      channelNumber: 2037,
      units: '',
    },
    {
      channelName: 'RPM',
      channelNumber: 2038,
      units: '',
    },
    {
      channelName: 'Engine Temp 1',
      channelNumber: 2039,
      units: '°C',
      ranges: [
        { low: 100, high: 120, colour: 'yellow' },
        { low: 120, high: 200, colour: 'red' },
      ],
    },
    {
      channelName: 'Engine Temp 2',
      channelNumber: 2040,
      units: '°C',
      ranges: [
        { low: 100, high: 120, colour: 'yellow' },
        { low: 120, high: 200, colour: 'red' },
      ],
    },
    {
      channelName: 'Oil Temp',
      channelNumber: 2041,
      units: '°C',
      ranges: [
        { low: 90, high: 100, colour: 'yellow' },
        { low: 100, high: 200, colour: 'red' },
      ],
    },
    {
      channelName: 'Radiator Inlet Temp',
      channelNumber: 2042,
      units: '°C',
    },
    {
      channelName: 'Battery Voltage',
      channelNumber: 2043,
      units: 'Volts',
      ranges: [
        { low: 12.8, high: 13.1, colour: 'yellow' },
        { low: 0, high: 12.8, colour: 'red' },
      ],
    },
    {
      channelName: 'Oil Pressure',
      channelNumber: 2044,
      units: 'psi',
    },
    {
      channelName: 'Front Brake Pressure',
      channelNumber: 2045,
      units: 'psi',
    },
    {
      channelName: 'Front Left Potentiometer',
      channelNumber: 2046,
      units: 'Volts',
    },
    {
      channelName: 'Front Right Potentiometer',
      channelNumber: 2047,
      units: 'Volts',
    },
    {
      channelName: 'Lambda 1',
      channelNumber: 2048,
      units: 'λ',
    },
    {
      channelName: 'Lambda 2',
      channelNumber: 2049,
      units: 'λ',
    },
    {
      channelName: 'Left Drive Speed',
      channelNumber: 2050,
      units: 'm/s',
    },
    {
      channelName: 'Left Ground Speed',
      channelNumber: 2051,
      units: 'm/s',
    },
    {
      channelName: 'Rear Left Potentiometer',
      channelNumber: 2052,
      units: 'Volts',
    },
    {
      channelName: 'Right Drive Speed',
      channelNumber: 2053,
      units: 'm/s',
    },
    {
      channelName: 'Right Ground Speed',
      channelNumber: 2054,
      units: 'm/s',
    },
    {
      channelName: 'Throttle',
      channelNumber: 2055,
      units: '%',
    },
    {
      channelName: 'Beacon',
      channelNumber: 2056,
      units: '',
    },
    {
      channelName: 'Gear Change Cut',
      channelNumber: 2057,
      units: '',
    },
    {
      channelName: 'Error Group 6',
      channelNumber: 2058,
      units: '',
    },
    {
      channelName: 'Error Group 7',
      channelNumber: 2059,
      units: '',
    },
    {
      channelName: 'Cut Level Total',
      channelNumber: 2060,
      units: '',
    },
    {
      channelName: 'Steering Angle',
      channelNumber: 2061,
      units: '°',
    },
    {
      channelName: 'Vertical G-Force',
      channelNumber: 6245,
      units: 'g',
      conversion: [{ x: 1, y: 0.001 }],
    },
    {
      channelName: 'Latitudinal G-Force',
      channelNumber: 6246,
      units: 'g',
      conversion: [{ x: 1, y: 0.001 }],
    },
    {
      channelName: 'Longitudinal G-Force',
      channelNumber: 6247,
      units: 'g',
      conversion: [{ x: 1, y: 0.001 }],
    },
    {
      channelName: 'Yaw',
      channelNumber: 6249,
      units: 'Degrees per second (°/s)',
      conversion: [{ x: 1, y: 0.1 }],
    },
    {
      channelName: 'Roll',
      channelNumber: 6250,
      units: 'Degrees per second (°/s)',
      conversion: [{ x: 1, y: 0.1 }],
    },
    {
      channelName: 'Pitch',
      channelNumber: 6251,
      units: 'Degrees per second (°/s)',
      conversion: [{ x: 1, y: 0.1 }],
    },
    {
      channelName: 'Z-axis Compass',
      channelNumber: 6253,
      units: 'Magnetic direction',
    },
    {
      channelName: 'Y-axis Compass',
      channelNumber: 6254,
      units: 'Magnetic direction',
    },
    {
      channelName: 'X-axis Compass',
      channelNumber: 6255,
      units: 'Magnetic direction',
    },
    {
      channelName: 'Latitude',
      channelNumber: 10000,
      units: 'Degrees',
    },
    {
      channelName: 'Longitude',
      channelNumber: 10001,
      units: 'Degrees',
    },
    {
      channelName: 'Laptime',
      channelNumber: 6260,
      units: 'sec',
    },
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
    live: [
      2037, // ECU START
      2038,
      2039,
      2040,
      2041,
      2042,
      2043,
      2044,
      2045,
      2046,
      2047,
      2048,
      2049,
      2050,
      2051,
      2052,
      2053,
      2054,
      2055,
      2056,
      2057,
      2058,
      2059,
      2060,
      2061, // ECU END
      6245, // IMU START
      6246,
      6247,
      6249,
      6250,
      6251,
      6253,
      6254,
      6255, // IMU END
      10000, // GPS START
      10001, // GPS END
    ],
  },
};

export default class ConfigsClient {
  getConfig(): Config {
    return defaultConfig;
  }
}
