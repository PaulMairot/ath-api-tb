import createDebugger from 'debug';
import { WebSocketServer } from 'ws';

const debug = createDebugger('express-api:websocket');

const clients = [];

export function createWebSocketServer(httpServer) {
  debug('Creating WebSocket server');
  const wss = new WebSocketServer({
    server: httpServer,
  });

  // Handle new client connections.
  wss.on('connection', function (ws) {
    debug('New WebSocket client connected');
    console.log('New WebSocket client connected');
    // Keep track of clients.
    clients.push(ws);

    // Clean up disconnected clients.
    ws.on('close', () => {
      clients.splice(clients.indexOf(ws), 1);
      debug('WebSocket client disconnected');
    });
  });
}

export function broadcastData(data) {
  debug(
    `Broadcasting data to all connected clients: ${JSON.stringify(data)}`
  );
  
  clients.forEach(client => {
    client.send(JSON.stringify(data));
  })
}

