import WebSocket from 'ws';
import udp from 'dgram';
import './extensions/serverExtensions';

// UDP ports
const UDP_PORT = 12000;

// Websocket ports
const WEBSOCKET_PORT = 8080;

// Websocket Server
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT, path: '/api/stream' });
wss.on('connection', () => console.log('Client connected to websocket'));
wss.on('listening', () => console.log(`Websocket:\t${WEBSOCKET_PORT}`));

// UDP Server
const udpServer = udp.createSocket('udp4');
udpServer.on('message', (msg, rinfo) => wss.broadcast(msg.toString())); // broadcast packet to all clients
udpServer.on('listening', () =>
  console.log(`UDP Socket:\t${udpServer.address().port}`),
);
udpServer.bind(UDP_PORT);
