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
  cors: { origin: "*", methods: ["GET", "POST","PUT"] },
});

// Rendre io accessible globalement
global.io = io;

// Gestionnaire de connexions Socket.IO avec système de rooms amélioré
io.on("connection", (socket) => {
  console.log(`Client connected avec: ${socket.id}`);

  // Événement login pour que l'utilisateur rejoigne sa propre room (basée sur son ID)
  socket.on("login", ({ userId, role, roleTunisair, TypePersonnel }) => {
    if (userId) {
      socket.join(userId);
       console.log(`Socket ${socket.id} rejoint la room ${userId}`);
    }
    if (role === "Personnel Tunisie Catering") {
      socket.join("tunisie_catering");
    }
    if (
      role === "Personnel Tunisair" &&
      roleTunisair === "Personnel de Direction du Catering Tunisiar"
    ) {
      socket.join("Direction_Catering_Tunisair");
      console.log(`User ${socket.id} joined Direction_Catering_Tunisair room`);
    }
    if (
      role === "Personnel Tunisair" &&
      roleTunisair === "Personnel navigant" &&
      TypePersonnel === "Chef de cabine"
    ) {
      socket.join("chef_cabine");
      onsole.log(`Socket ${socket.id} a rejoint la room chef_cabine`);
    }
    // Confirmer la connexion à l'utilisateur
    socket.emit("loginConfirmed", { userId, socketId: socket.id });
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
  broadcastNewBonLivraison: (data) => {
    io.emit("NewBonLivraison", data);
    console.log(`Destinataire  ${data.destinataire}`);
    if (data.destinataire) {
      io.to(data.destinataire).emit("newNotification", {
        ...data,
        notificationType: "new_bonLivraison",
        destinataire: data.destinataire,
      });
    }
  },

  broadcastBonLivraisonStatusUpdate: (data) => {
    if (data.destinataire) {
      console.log(`Destinataire  ${data.destinataire}`);
      io.to(data.destinataire).emit("BonLivraisonStatusUpdate", data);
      io.to(data.destinataire).emit("newNotification", {
        ...data,
        notificationType: "statut_bonLivraison",
        destinataire: data.destinataire,
      });
    }
  },
  broadcastNewOrder: (data) => {
    const destinataireId = data.destinataire;
    io.emit("newOrder", data);
    if (destinataireId) {
      io.to(destinataireId).emit("newNotification", {
        ...data,
        notificationType: "new_order",
        destinataire: destinataireId,
      });
    }
  },

  broadcastOrderStatusUpdate: (data) => {
    if (data.destinataire) {
      console.log(`Destinataire  ${data.destinataire}`);
      io.to(data.destinataire).emit("orderStatusUpdate", data);
      /*io.to(data.destinataire).emit("newNotification", {
        ...data,
        notificationType: "update_status",
        destinataire: data.destinataire,
      });*/
    }
  },

  broadcastNewFacture: (data) => {
    const destinataireId = data.destinataire;
    io.to(destinataireId).emit("newFacture", data);
    console.log(`Destinataire  ${data.destinataire}`);
    /*if (destinataireId) {
      io.to(destinataireId).emit("newNotification", {
        ...data,
        notificationType: "new_facture",
        destinataire: destinataireId,
      });
    }*/
  },

  broadcastFactureStatusUpdate: (data) => {
    if (data.destinataire) {
      console.log(`Destinataire  ${data.destinataire}`);
      io.to(data.destinataire).emit("factureStatusUpdate", data);
      /*io.to(data.destinataire).emit("newNotification", {
        ...data,
        notificationType: "status_update_facture",
        destinataire: data.destinataire,
      });*/
    }
  },

  broadcastNewReclamation: (data) => {
    const destinataireId = data.destinataire;
    io.emit("NewReclamation", data);
    console.log(`Destinataire  ${data.destinataire}`);
    if (destinataireId) {
      io.to(destinataireId).emit("newNotification", {
        ...data,
        notificationType: "new_reclamation",
        destinataire: destinataireId,
      });
    }
  },

  broadcastReclamationStatusUpdate: (data) => {
    if (data.destinataire) {
      console.log(`Destinataire  ${data.destinataire}`);
      io.to(data.destinataire).emit("ReclamationStatusUpdate", data);
      /*io.to(data.destinataire).emit("newNotification", {
        ...data,
        notificationType: "update_reclamation",
        destinataire: data.destinataire,
      });*/
    }
  },
  broadcastNewNotification:(data)=>{
    io.emit("NotificationProbeleme", data);
  },
  sendNotification: (userId, type, data) => {
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
app.use("/api/auth", authRouter);
app.use("/api/prelevement", prelevementRoute);
app.use("/api/personnelTunisair", personnelTunisairRoute);
const bonLivraisonRouter = require("./routes/bonLivraisonRoute")(
  socketHandlers.broadcastNewBonLivraison,
  socketHandlers.broadcastBonLivraisonStatusUpdate
);
app.use("/api/bonLivraison", bonLivraisonRouter);
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
const notificationRoute = require("./routes/NotificationRoute")(
  socketHandlers.broadcastNewNotification
);
app.use("/api/notification", notificationRoute);
// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/Tuncatering")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
