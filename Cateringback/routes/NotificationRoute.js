const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlware/auth");
const notification = require("../models/NotificationModel");
module.exports = function (broadcastNewNotification) {
router.post('/Probleme',authenticateToken,async(req,res)=>{
    try{
        const {message}=req.body;
        const Matricule = req.user.Matricule;
        const notif=await notification.create({
            emetteur:Matricule,
            destinataire:"personnels navigant",
            notificationType:'problème',
            message:message
        });
        broadcastNewNotification({
          ...notif._doc,
        });
        res.status(201).json({ message: "Notification envoyée avec succès.", notification: notif });
    }catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
        res.status(500).json({ message: "Erreur serveur lors de l'envoi de la notification." });
    }
})
return router;
};