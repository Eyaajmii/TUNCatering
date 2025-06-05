const notification = require("../models/NotificationModel");
class NotificationController {
  static async EnvoyerNotification(message, Matricule) {
    try {
      const notif = await notification.create({
        emetteur: Matricule,
        destinataire: "personnels navigant",
        notificationType: "problème",
        message: message,
      });
      console.log(notif);
      return notif;
    } catch (err) {
      throw err;
    }
  }
  static async ConsulterNotif(req, res) {
    try {
      const { role, roleTunisair, TypePersonnel, _id } = req.user;

      let destinataires = [];

      if (role === "Personnel Tunisie Catering") {
        destinataires = ["personnels navigant", "tunisie_catering"];
      } else if (
        role === "Personnel Tunisair" &&
        roleTunisair === "Personnel de Direction du Catering Tunisiar"
      ) {
        destinataires = ["Direction_Catering_Tunisair", "personnels navigant"];
      } else if (role === "Administrateur") {
        destinataires = ["personnels navigant"];
      } else if (
        role === "Personnel Tunisair" &&
        roleTunisair === "Personnel navigant" &&
        TypePersonnel === "Chef de cabine"
      ) {
        destinataires = ["personnels navigant", "chef_cabine"];
      } else {
        destinataires = ["personnels navigant", _id];
      }

      const notifications = await notification
        .find({ destinataire: { $in: destinataires } })
        .sort({ createdAt: -1 });

      return res.status(200).json(notifications);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
  static async ReadNotif(id) {
    try {
      const notif = await notification.findById(id);
      if (!notif) {
        return res.status(404).json({ message: "Notification not found" });
      }

      notif.isRead = true;
      await notif.save();

      res.json({ message: "Notification marked as read", notification });
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}
module.exports = NotificationController;