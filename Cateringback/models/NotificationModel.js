const mongoose = require("mongoose");
const NotificationSchema=new mongoose.Schema({
    message:{ 
        type: String, 
        required: true 
    },
    createdAt:{
        type: Date, 
        default: Date.now 
    },
    user:{
        type:String,
        required: true 
    },
    isRead:{ 
        type: Boolean, 
        default: false 
    },
    notificationType:{ 
        type: String, 
        enum: ['info', 'warning', 'error'], 
        required: true 
    },
    commandeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: false
  }
})
module.exports = mongoose.model('Notification', NotificationSchema);