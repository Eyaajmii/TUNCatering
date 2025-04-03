const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const setupWebSocket = require('./websocket');
const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/mealRoute');
const menuRoute = require('./routes/menuRoute');
const volRoute = require('./routes/volRoute');
const pnRouter = require("./routes/pnRouter");
const chatRoute = require("./routes/ChatbotNLPRoute");
const methodOverride = require("method-override");
const cors = require('cors');

const app = express();
const PORT = 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket and get broadcast functions
const { broadcastNewOrder, broadcastOrderStatusUpdate } = setupWebSocket(server);

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use('/uploads', express.static('uploads'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meal', mealRoutes);
app.use("/api/menu", menuRoute);
app.use("/api/vol", volRoute);
app.use("/api/pn", pnRouter);
app.use("/api/chat", chatRoute);

// Import and use commandeRoute with injected WebSocket functions
const commandeRoute = require("./routes/commandeRoute")(broadcastNewOrder, broadcastOrderStatusUpdate);
app.use("/api/commande", commandeRoute);

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/Tuncateringgggggggggggg")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});