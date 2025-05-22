const express = require("express");
const router = express.Router();
const PersonnelTunisair = require("../models/PersonnelTunisairModel");
const User = require("../models/User");

router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const personnel = await PersonnelTunisair.findOne({ userId: user._id });
    if (!personnel)
      return res.status(404).json({ message: "Personnel non trouvé" });

    res.json({ roleTunisair: personnel.roleTunisair });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;
