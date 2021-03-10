import React, { useState } from 'react';
import { Tab, Modal, Button } from 'react-bootstrap';
import Client from '../../common/clients/clients';
import TabConfig from '../../common/models/TabConfig';
import modalStyles from '../../common/styles/Modal.module.css';
import buttonStyles from '../../common/styles/Button.module.css';
import settingsStyles from './Settings.module.css';
import TabConfiguration from './TabConfiguration';

interface Props {
  show: boolean;
  clients: Client;
  tabId: string;
  tabConfig: TabConfig;
  canDelete: boolean;
  updateConfig: () => void;
  onDelete: () => void;
}

export default function SettingsModal(props: Props): JSX.Element {
  const [show, setShow] = useState(props.show);

  const [tabName, setTabName] = useState(props.tabConfig.name);

  const handleClose = (): void => {
    props.updateConfig();
    setShow(false);
  };

  const handleShow = (): void => {
    setShow(true);
  };

  const onTabNameChange = (name: string): void => {
    props.clients.dashboards.updateTabName(props.tabId, name);
    setTabName(name);
  };

  const deleteTab = (): void => {
    props.clients.dashboards.deleteTab(props.tabId);
    props.onDelete();
    setShow(false);
  };

  const deleteButton = props.canDelete ? (
    <Button style={{ width: '120px' }} onClick={(): void => deleteTab()}>
      Delete Tab
    </Button>
  ) : (
    <></>
  );

  return (
    <>
      <Button
        className={`${buttonStyles.inline} ${buttonStyles.bar}`}
        variant="dark"
        onClick={handleShow}
      >
        Settings
      </Button>
      <Modal
        className="rounded-0"
        dialogClassName={modalStyles.mainmodal}
        show={show}
        onHide={handleClose}
        animation={false}
      >
        <Modal.Header
          style={{ borderRadius: 0 }}
          className={modalStyles.header}
        >
          <Modal.Title>
            <input
              style={{ width: 'calc(100% - 120px)' }}
              className={settingsStyles.title}
              type="text"
              value={tabName}
              onChange={(event): void => onTabNameChange(event.target.value)}
            />
            {deleteButton}
          </Modal.Title>
        </Modal.Header>
        <Tab.Pane active={true}>
          <Modal.Body className={modalStyles.body}>
            <div className={settingsStyles.settings}>
              <TabConfiguration
                title="Left Column"
                key={`${props.tabId}-left`}
                clients={props.clients}
                tabId={props.tabId}
                column={0}
                updateConfig={props.updateConfig}
              />
              <TabConfiguration
                key={`${props.tabId}-right`}
                title="Right Column"
                clients={props.clients}
                tabId={props.tabId}
                column={1}
                updateConfig={props.updateConfig}
              />
            </div>
          </Modal.Body>
        </Tab.Pane>
      </Modal>
    </>
  );
}
