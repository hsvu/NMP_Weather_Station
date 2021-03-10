import React from 'react';
import Config from './Config';
import WidgetSettings from './WidgetSettings';

export interface WidgetSettingsProps<T> {
  config: Config;
  existingSettings?: WidgetSettings<T>;
  onSettingsChange(settings: WidgetSettings<unknown>): void;
}

export default interface IWidgetSettingsComponent
  extends React.Component<WidgetSettingsProps<unknown>, {}> {
  validState(): boolean;
}
