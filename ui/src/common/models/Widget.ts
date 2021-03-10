import React from 'react';
import IWidget from './IWidget';
import IWidgetSettingsComponent, {
  WidgetSettingsProps,
} from './IWidgetSettingsComponent';
import WidgetProps from './WidgetProps';

export default abstract class Widget<P, S> extends React.Component<
  WidgetProps<P>,
  S
> {
  static widgetId: string;

  static widgetName: string;

  static create(
    ref: React.RefObject<Widget<unknown, unknown>>,
    props: WidgetProps<unknown>,
  ): React.ReactElement<IWidget> | null {
    return null;
  }

  static settingsComponent(
    ref: React.RefObject<IWidgetSettingsComponent>,
    props: WidgetSettingsProps<unknown>,
  ): React.ReactElement<IWidgetSettingsComponent> | null {
    return null;
  }
}
