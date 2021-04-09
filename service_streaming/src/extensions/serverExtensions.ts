import { Server } from 'ws';

/**
 * Broadcasts a message to all clients
 */
Server.prototype.broadcast = function broadcast(msg: string): void {
  console.log(msg);
  this.clients.forEach((ws) => {
    ws.send(msg);
  });
};
