const mongoose = require("mongoose");
const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  notificationType: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model('Notification', NotificationSchema);