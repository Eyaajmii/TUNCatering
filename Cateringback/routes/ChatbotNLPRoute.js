const express = require("express");
const router = express.Router();
const { chatbotMessage } = require("../controllers/ChatbotNLPController");

router.post("/message", chatbotMessage);

module.exports = router;
