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
  //commande
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
  //facture
  function broadcastNewFacture(Facture){
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "NEW_Facture",
            data: Facture,
          })
        );
      }
    })
  }
  function broadcastFactureStatusUpdate(updatedFacture) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "STATUS_UPDATE",
            data: updatedFacture,
          })
        );
      }
    });
  }
  //reclamation
  function broadcastNewReclamation(reclamation) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "NEW_RECLAMATION",
            data: reclamation,
          })
        );
      }
    });
  }

  function broadcastReclamationStatusUpdate(updatedReclamation) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "STATUS_UPDATE",
            data: updatedReclamation,
          })
        );
      }
    });
  }
  return {
    broadcastNewOrder,
    broadcastOrderStatusUpdate,
    broadcastNewFacture,
    broadcastFactureStatusUpdate,
    broadcastNewReclamation,
    broadcastReclamationStatusUpdate,
  };
}

module.exports = setupWebSocket;