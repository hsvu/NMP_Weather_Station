import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import IWidgetSettingsComponent, {
  WidgetSettingsProps,
} from '../../common/models/IWidgetSettingsComponent';
import ValuesConfig from './ValuesConfig';
import { ReactComponent as DeleteBin } from '../../common/icons/bin.svg';
import WidgetSettings from '../../common/models/WidgetSettings';
import buttonStyles from '../../common/styles/Button.module.css';
import dropdownStyles from '../../common/styles/Dropdown.module.css';
import draggableStyles from '../../common/styles/Draggable.module.css';
import styles from './Value.module.css';

class ValuesSettings
  extends React.Component<
    WidgetSettingsProps<ValuesConfig>,
    WidgetSettings<ValuesConfig>
  >
  implements IWidgetSettingsComponent {
  constructor(props: WidgetSettingsProps<ValuesConfig>) {
    super(props);

    this.state = {
      width: props.existingSettings?.width || 12,
      mobileWidth: props.existingSettings?.mobileWidth || 12,
      config: {
        channels: props.existingSettings?.config.channels || [],
      },
    };
  }

  componentDidMount(): void {
    setImmediate(() => this.props.onSettingsChange(this.state));
  }

  componentDidUpdate(): void {
    this.props.onSettingsChange(this.state);
  }

  handleOnValueEnd(result: DropResult): void {
    if (!result.destination) return;

    const { channels } = this.state.config;
    const [reorderedItem] = channels.splice(result.source.index, 1);
    channels.splice(result.destination.index, 0, reorderedItem);

    this.setState({
      config: {
        channels,
      },
    });
  }

  addLiveValue(channelNumber: number): void {
    this.setState((state) => ({
      config: {
        channels: [...state.config.channels, channelNumber],
      },
    }));
  }

  deleteLiveValue(index: number): void {
    this.setState((state) => {
      const { channels } = state.config;
      channels.splice(index, 1);
      return {
        config: {
          channels,
        },
      };
    });
  }

  validState(): boolean {
    return this.state.config.channels.length > 0;
  }

  render(): JSX.Element {
    const valueOptions = this.props.config.inputs
      .filter(
        (inputConfig) =>
          !this.state.config.channels.find(
            (channel) => channel === inputConfig.channelNumber,
          ) &&
          this.props.config.outputs.live.includes(inputConfig.channelNumber),
      )
      .map((inputConfig) => (
        <option
          key={inputConfig.channelNumber}
          value={inputConfig.channelNumber}
        >
          {inputConfig.channelName}
        </option>
      ));

    const valueConfigurations = this.state.config.channels.map(
      (channel, index) => {
        const channelName = this.props.config.inputs.find(
          (input) => input.channelNumber === channel,
        )?.channelName;

        return (
          <Row key={`AA-${channel}`}>
            <Col>
              <Draggable
                key={`AA-${channelName}_${channel}`}
                draggableId={`${channelName}`}
                index={index}
              >
                {(provided): JSX.Element => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {channelName}
                    <button
                      type="button"
                      className={`${buttonStyles.inline} ${styles.buttons} ${draggableStyles.trashcan}`}
                      onClick={(): void => this.deleteLiveValue(index)}
                    >
                      <DeleteBin className={styles.binIcon} />
                    </button>
                  </div>
                )}
              </Draggable>
            </Col>
          </Row>
        );
      },
    );

    return (
      <Container style={{ overflow: 'visible' }}>
        <DragDropContext
          onDragEnd={(result): void => this.handleOnValueEnd(result)}
        >
          <Droppable droppableId="draggables">
            {(provided): JSX.Element => (
              <ul
                className="draggables-2"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {valueConfigurations}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <select
          className={dropdownStyles.dropdown}
          value="default"
          onChange={(event): void =>
            this.addLiveValue(parseInt(event.target.value, 10))
          }
        >
          <option value="default" hidden={true}>
            Add Live Values
          </option>
          {valueOptions}
        </select>
      </Container>
    );
  }
}

export default ValuesSettings;
