const express = require("express");
const router = express.Router();
const { chatbotMessage } = require("../controllers/ChatbotNLPController");
const {authenticateToken}=require("../middlware/auth");
router.post("/message", authenticateToken, chatbotMessage);

module.exports = router;
