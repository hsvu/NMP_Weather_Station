import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import WidgetSettings from '../../common/models/WidgetSettings';
import widgets, { widgetsList } from '../../widgets/widgets';
import { ReactComponent as DeleteIcon } from '../../common/icons/bin.svg';
import { ReactComponent as EditIcon } from '../../common/icons/edit.svg';
import IWidgetSettingsComponent from '../../common/models/IWidgetSettingsComponent';
import Clients from '../../common/clients/clients';
import TabConfig from '../../common/models/TabConfig';
import dropdownStyles from '../../common/styles/Dropdown.module.css';
import buttonStyles from '../../common/styles/Button.module.css';
import styles from './Settings.module.css';

interface Props {
  title: string;
  clients: Clients;
  tabId: string;
  column: number;
  updateConfig: () => void;
}

interface State {
  editWidgetId?: string;
  editSettingsValid: boolean;
}

class TabConfiguration extends React.Component<Props, State> {
  tabConfig: TabConfig;

  editWidgetRef = React.createRef<IWidgetSettingsComponent>();

  editWidgetIndex?: number;

  editWidgetSettings?: WidgetSettings<unknown>;

  constructor(props: Props) {
    super(props);
    this.tabConfig = this.props.clients.dashboards.getTab(this.props.tabId);
    this.state = {
      editSettingsValid: false,
    };
  }

  onSettingsChange(settings: WidgetSettings<unknown>): void {
    this.editWidgetSettings = settings;
    const editSettingsValid = this.editWidgetRef.current?.validState() || false;
    if (editSettingsValid !== this.state.editSettingsValid) {
      this.setState({
        editSettingsValid,
      });
    }
  }

  addWidget(widgetId: string): void {
    this.props.updateConfig();
    this.setState({
      editWidgetId: widgetId,
    });
  }

  editWidget(widgetId: string, index: number): void {
    this.editWidgetIndex = index;
    this.editWidgetSettings = this.tabConfig.widgets[this.props.column][
      index
    ].settings;
    this.setState({
      editWidgetId: widgetId,
    });
  }

  deleteWidget(index: number): void {
    this.props.clients.dashboards.deleteWidget(
      this.props.tabId,
      this.props.column,
      index,
    );
    this.props.updateConfig();
    this.setState({});
  }

  saveWidgetChanges(): void {
    const editSettingsValid = this.editWidgetRef.current?.validState() || false;

    // Editing widget if there is an index in the widget list
    if (
      editSettingsValid &&
      this.editWidgetIndex !== undefined &&
      this.editWidgetSettings
    ) {
      this.props.clients.dashboards.updateWidgetSettings(
        this.props.tabId,
        this.props.column,
        this.editWidgetIndex,
        this.editWidgetSettings,
      );
    }

    // Adding widget if the widget isn't in the widget list yet
    else if (
      editSettingsValid &&
      this.state.editWidgetId &&
      this.editWidgetSettings
    ) {
      this.props.clients.dashboards.addWidget(
        this.props.tabId,
        this.props.column,
        this.state.editWidgetId,
        this.editWidgetSettings,
      );
    }

    // Reset edit
    this.editWidgetSettings = undefined;
    this.editWidgetIndex = undefined;
    this.setState({
      editWidgetId: undefined,
    });

    this.props.updateConfig();
  }

  discardWidgetChanges(): void {
    // Reset edit
    this.editWidgetSettings = undefined;
    this.editWidgetIndex = undefined;
    this.setState({
      editWidgetId: undefined,
    });
  }

  moveWidgetUp(index: number): void {
    this.props.clients.dashboards.moveWidgetUp(
      this.props.tabId,
      this.props.column,
      index,
    );
    this.setState({});
  }

  moveWidgetDown(index: number): void {
    this.props.clients.dashboards.moveWidgetDown(
      this.props.tabId,
      this.props.column,
      index,
    );
    this.setState({});
  }

  render(): JSX.Element {
    // Render widget settings
    if (this.state.editWidgetId) {
      return (
        <>
          <Button
            key="save-button"
            onClick={(): void => this.saveWidgetChanges()}
            disabled={!this.state.editSettingsValid}
          >
            Save
          </Button>
          <Button
            key="discard-button"
            onClick={(): void => this.discardWidgetChanges()}
          >
            Discard
          </Button>
          {widgets[this.state.editWidgetId].settingsComponent(
            this.editWidgetRef,
            {
              config: this.props.clients.configs.getConfig(),
              existingSettings: this.editWidgetSettings,
              onSettingsChange: (settings: WidgetSettings<unknown>) =>
                this.onSettingsChange(settings),
            },
          )}
        </>
      );
    }

    const widgetOptions = widgetsList.map((widget) => (
      <option key={widget.widgetId} value={widget.widgetId}>
        {widget.widgetName}
      </option>
    ));

    const handleOnWidgetDragEnd = (result: DropResult): void => {
      if (!result.destination) return;
      const items = Array.from(this.tabConfig.widgets[this.props.column]);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      this.props.clients.dashboards.updateWidgetPositions(
        this.props.tabId,
        this.props.column,
        items,
      );
      this.props.updateConfig();
    };

    const widgetConfigurations = this.tabConfig.widgets[this.props.column].map(
      (widgetConfig, index) => {
        const widgetName =
          widgetsList.find(
            (widget) => widget.widgetId === widgetConfig.widgetId,
          )?.widgetName || "Couldn't get widget name";

        return (
          <Row key={widgetConfig.widgetId} className={styles.widgetDraggable}>
            <Col>
              <Draggable
                key={`${widgetName}-${this.props.tabId}`}
                draggableId={`${widgetName}`}
                index={index}
              >
                {(provided): JSX.Element => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {widgetName}
                    <button
                      type="button"
                      className={`${buttonStyles.inline} ${styles.buttons}`}
                      onClick={(): void =>
                        this.editWidget(widgetConfig.widgetId, index)
                      }
                    >
                      <EditIcon style={{ width: '25px' }} />
                    </button>
                    <button
                      type="button"
                      className={`${buttonStyles.inline} ${styles.buttons}`}
                      onClick={(): void => this.deleteWidget(index)}
                    >
                      <DeleteIcon style={{ width: '25px' }} />
                    </button>
                  </li>
                )}
              </Draggable>
            </Col>
          </Row>
        );
      },
    );

    return (
      <>
        <Row>
          <Col>
            <h4>{this.props.title}</h4>
          </Col>
        </Row>

        <DragDropContext onDragEnd={handleOnWidgetDragEnd}>
          <Droppable droppableId="draggables-3">
            {(provided): JSX.Element => (
              <ul
                className="draggables"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {widgetConfigurations}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <Row style={{ marginBottom: '20px' }}>
          <Col>
            <select
              className={dropdownStyles.dropdown}
              value="default"
              onChange={(event): void => this.addWidget(event.target.value)}
            >
              <option value="default" hidden={true}>
                Add Widget
              </option>
              {widgetOptions}
            </select>
          </Col>
        </Row>
      </>
    );
  }
}

export default TabConfiguration;
