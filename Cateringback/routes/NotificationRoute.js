const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlware/auth");
const notificationController=require("../controllers/NotificationController");
const notification = require("../models/NotificationModel");

module.exports = function (broadcastNewNotification) {
router.post('/Probleme',authenticateToken,async(req,res)=>{
    try{
        const {message}=req.body;
        const Matricule = req.user.Matricule;
        const notif = await notificationController.EnvoyerNotification(message,Matricule);
        broadcastNewNotification({
          ...notif._doc,
        });
        res.status(201).json({ message: "Notification envoyée avec succès.", notification: notif });
    }catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
        res.status(500).json({ message: "Erreur serveur lors de l'envoi de la notification." });
    }
});
router.get( "/notifications",authenticateToken,notificationController.ConsulterNotif);
router.get('/all',async(req,res)=>{
  const all=await notification.find();
  res.status(200).json({
    message: "Notifications récupérées avec succès.",
    all
  });
});
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await notificationController.ReadNotif(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
})
return router;
};