// websocket.js
const WebSocket = require('ws');

const clients = new Set();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected');

    ws.on('message', (message) => {
      console.log('Received message from client:', message.toString());
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function broadcastNewOrder(order) {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'NEW_ORDER',
          data: order
        }));
      }
    });
  }

  function broadcastOrderStatusUpdate(updatedOrder) {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'STATUS_UPDATE',
          data: updatedOrder
        }));
      }
    });
  }

  return {
    broadcastNewOrder,
    broadcastOrderStatusUpdate
  };
}

module.exports = setupWebSocket;