const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
require("dotenv").config();
require('./cron');
const mealRoutes = require("./routes/mealRoute");
const menuRoute = require("./routes/menuRoute");
const volRoute = require("./routes/volRoute");
const CarnetSanteRoute = require("./routes/CarnetSanteRouter");
const bonLivraisonRouter = require("./routes/bonLivraisonRoute");
const authRouter = require("./routes/auth");
const chatRoute = require("./routes/ChatbotNLPRoute");
const prelevementRoute = require("./routes/Prelevementroute");
const personnelTunisairRoute = require("./routes/PersonnelTunisairRoute");
const methodOverride = require("method-override");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const PORT = 5000;
// Create HTTP server
const server = http.createServer(app);

// Configuration de Socket.IO
const io = socketIo(server, {
  cors: { origin: "*" },
});

// Rendre io accessible globalement
global.io = io;

// Gestionnaire de connexions Socket.IO avec système de rooms amélioré
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Événement login pour que l'utilisateur rejoigne sa propre room (basée sur son ID)
  socket.on("login", (userId) => {
    if (userId) {
      console.log(
        `User ${userId} logged in and joined personal room: ${userId}`
      );
      socket.join(userId);
      // Confirmer la connexion à l'utilisateur
      socket.emit("loginConfirmed", { userId, socketId: socket.id });
    } else {
      console.warn(
        `Socket ${socket.id} attempted to login with invalid/empty user ID.`
      );
    }
  });

  // Pour rejoindre d'autres rooms au besoin (groupes, etc.)
  socket.on("joinRoom", (roomName) => {
    if (roomName) {
      console.log(`Socket ${socket.id} joining room: ${roomName}`);
      socket.join(roomName);
    } else {
      console.warn(
        `Socket ${socket.id} tried to join a room with an invalid/empty name.`
      );
    }
  });

  // Quitter une room
  socket.on("leaveRoom", (roomName) => {
    if (roomName) {
      console.log(`Socket ${socket.id} leaving room: ${roomName}`);
      socket.leave(roomName);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Gestionnaires de notifications centralisés avec ciblage par room
const socketHandlers = {
  broadcastNewOrder: (data) => {
    console.log(
      "[SocketHandler] broadcastNewOrder called. Data:",
      JSON.stringify(data, null, 2)
    );
    if (data && data.destinataire) {
      io.to(data.destinataire).emit("newOrder", data);
      console.log(
        `[SocketHandler] newOrder emitted to user: ${data.destinataire}`
      );
    } else {
      console.warn(
        `[SocketHandler] newOrder: 'destinataire' is missing or invalid. Data: ${JSON.stringify(
          data
        )}`
      );
    }
  },

  broadcastOrderStatusUpdate: (data) => {
    console.log(
      "[SocketHandler] broadcastOrderStatusUpdate called. Data:",
      JSON.stringify(data, null, 2)
    );
    if (data && data.destinataire) {
      io.to(data.destinataire).emit("orderStatusUpdate", data);
      console.log(
        `[SocketHandler] orderStatusUpdate emitted to user: ${data.destinataire}`
      );
    } else {
      console.warn(
        `[SocketHandler] orderStatusUpdate: 'destinataire' is missing or invalid. Data: ${JSON.stringify(
          data
        )}`
      );
    }
  },

  broadcastNewFacture: (data) => {
    console.log(
      "[SocketHandler] broadcastNewFacture called. Data:",
      JSON.stringify(data, null, 2)
    );
    if (data && data.destinataire) {
      io.to(data.destinataire).emit("newFacture", data);
      console.log(
        `[SocketHandler] newFacture emitted to user: ${data.destinataire}`
      );
    } else {
      console.warn(
        `[SocketHandler] newFacture: 'destinataire' is missing or invalid. Data: ${JSON.stringify(
          data
        )}`
      );
    }
  },

  broadcastFactureStatusUpdate: (data) => {
    console.log(
      "[SocketHandler] broadcastFactureStatusUpdate called. Data:",
      JSON.stringify(data, null, 2)
    );
    if (data && data.destinataire) {
      io.to(data.destinataire).emit("factureStatusUpdate", data);
      console.log(
        `[SocketHandler] factureStatusUpdate emitted to user: ${data.destinataire}`
      );
    } else {
      console.warn(
        `[SocketHandler] factureStatusUpdate: 'destinataire' is missing or invalid. Data: ${JSON.stringify(
          data
        )}`
      );
    }
  },

  broadcastNewReclamation: (data) => {
    console.log(
      "[SocketHandler] broadcastNewReclamation called. Data:",
      JSON.stringify(data, null, 2)
    );
    if (data && data.destinataire) {
      io.to(data.destinataire).emit("newReclamation", data);
      console.log(
        `[SocketHandler] newReclamation emitted to user: ${data.destinataire}`
      );
    } else {
      console.warn(
        `[SocketHandler] newReclamation: 'destinataire' is missing or invalid. Data: ${JSON.stringify(
          data
        )}`
      );
    }
  },

  broadcastReclamationStatusUpdate: (data) => {
    console.log(
      "[SocketHandler] broadcastReclamationStatusUpdate called. Data:",
      JSON.stringify(data, null, 2)
    );
    if (data && data.destinataire) {
      io.to(data.destinataire).emit("reclamationStatusUpdate", data);
      console.log(
        `[SocketHandler] reclamationStatusUpdate emitted to user: ${data.destinataire}`
      );
    } else {
      console.warn(
        `[SocketHandler] reclamationStatusUpdate: 'destinataire' is missing or invalid. Data: ${JSON.stringify(
          data
        )}`
      );
    }
  },

  // Fonction générique pour envoyer des notifications
  sendNotification: (userId, type, data) => {
    if (!userId) {
      console.warn(
        `[SocketHandler] sendNotification: No userId provided for ${type} notification`
      );
      return;
    }

    console.log(
      `[SocketHandler] Sending ${type} notification to user ${userId}`
    );
    io.to(userId).emit("newNotification", {
      ...data,
      notificationType: type,
      destinataire: userId,
    });
  },
};

// Make socketHandlers accessible via the application
app.set("socketHandlers", socketHandlers);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/plat", mealRoutes);
app.use("/api/menu", menuRoute);
app.use("/api/vol", volRoute);
app.use("/api/carnetsante", CarnetSanteRoute);
app.use("/api/chatbot", chatRoute);
app.use("/api/bonLivraison", bonLivraisonRouter);
app.use("/api/auth", authRouter);
app.use("/api/prelevement", prelevementRoute);
app.use("/api/personnelTunisair", personnelTunisairRoute);

// Import and configure routes with socket handlers
const reclamationRouter = require("./routes/ReclamationRoute")(
  socketHandlers.broadcastNewReclamation,
  socketHandlers.broadcastReclamationStatusUpdate
);
app.use("/api/reclamation", reclamationRouter);

const FactureRoute = require("./routes/FactureRoute")(
  socketHandlers.broadcastNewFacture,
  socketHandlers.broadcastFactureStatusUpdate
);
app.use("/api/facture", FactureRoute);

const commandeRoute = require("./routes/commandeRoute")(
  socketHandlers.broadcastNewOrder,
  socketHandlers.broadcastOrderStatusUpdate
);
app.use("/api/commande", commandeRoute);

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/Tuncatering")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
