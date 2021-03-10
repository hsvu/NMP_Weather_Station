import { v4 as uuid } from 'uuid';
import TabConfig, { TabWidgetConfig } from '../models/TabConfig';
import WidgetSettings from '../models/WidgetSettings';

export default class DashboardsClient {
  private config: {
    [tabId: string]: TabConfig;
  };

  constructor() {
    // Check if there is a locally stored config
    const localConfig = localStorage.getItem('weather-dasboard-config');
    if (localConfig) this.config = JSON.parse(localConfig);
    else this.config = {};
  }

  saveConfig(): void {
    localStorage.setItem(
      'weather-dasboard-config',
      JSON.stringify(this.config),
    );
  }

  updateConfig(): void {
    const localConfig = localStorage.getItem('weather-dasboard-config');
    if (localConfig) {
      this.config = JSON.parse(localConfig);
    }
  }

  getTabs(): [string, TabConfig][] {
    return Object.entries(this.config);
  }

  getDefaultTabId(): string | undefined {
    return Object.keys(this.config)[0];
  }

  getTab(tabId: string): TabConfig {
    return this.config[tabId];
  }

  addTab(): string {
    const tabId = uuid();

    this.config[tabId] = {
      name: 'New Tab',
      widgets: [[], []],
    };

    this.saveConfig();

    return tabId;
  }

  deleteTab(tabId: string): void {
    delete this.config[tabId];
    this.saveConfig();
  }

  updateTabName(tabId: string, name: string): void {
    this.config[tabId].name = name;
    this.saveConfig();
  }

  addWidget(
    tabId: string,
    column: number,
    widgetId: string,
    settings: WidgetSettings<unknown>,
  ): void {
    this.config[tabId].widgets[column].push({
      widgetId,
      settings,
    });
    this.saveConfig();
  }

  updateWidgetSettings(
    tabId: string,
    column: number,
    widgetIndex: number,
    settings: WidgetSettings<unknown>,
  ): void {
    this.config[tabId].widgets[column][widgetIndex].settings = settings;
    this.saveConfig();
  }

  deleteWidget(tabId: string, column: number, index: number): void {
    this.config[tabId].widgets[column].splice(index, 1);
    this.saveConfig();
  }

  updateWidgetPositions(
    tabId: string,
    column: number,
    ws: TabWidgetConfig[],
  ): void {
    this.config[tabId].widgets[column] = ws;
    this.saveConfig();
  }

  moveWidgetUp(tabId: string, column: number, index: number): void {
    const widgets = this.config[tabId].widgets[column];
    widgets.splice(index - 1, 2, widgets[index], widgets[index - 1]);
    this.saveConfig();
  }

  moveWidgetDown(tabId: string, column: number, index: number): void {
    const widgets = this.config[tabId].widgets[column];
    widgets.splice(index, 2, widgets[index + 1], widgets[index]);
    this.saveConfig();
  }
}
