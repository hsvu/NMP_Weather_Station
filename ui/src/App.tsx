import React from 'react';
import Clients from './common/clients/clients';
import 'react-toastify/dist/ReactToastify.css';
import Live from './live/Live';
import './App.css';

export default function App(): JSX.Element {
  const clients = new Clients();
  return <Live clients={clients} />;
}
