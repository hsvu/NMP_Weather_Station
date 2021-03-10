import BootstrapWidth from './BootstrapWidth';

export default interface WidgetSettings<T> {
  width: BootstrapWidth;
  mobileWidth: BootstrapWidth;
  config: T;
}
