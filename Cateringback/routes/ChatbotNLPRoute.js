const express = require("express");
const router = express.Router();
const { chatbotMessage,resetConversation } = require("../controllers/ChatbotNLPController");
const {authenticateToken}=require("../middlware/auth");
router.post("/message", authenticateToken, chatbotMessage);
router.post("/reset", authenticateToken, resetConversation);
module.exports = router;
