const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const logAction = require("../middlware/logAction"); // Import du middleware
const router = express.Router();
const mongoose = require("mongoose"); // Importez mongoose
// Middleware logAction pour chaque requête sur ces routes
router.use(logAction);

router.post("/register", async (req, res) => {
  try {
    const { email, password, username, nom, prenom, telephone } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Hacher le mot de passe avant de le stocker
    const hashedPassword = await bcrypt.hash(password, 10); // 10 est le coût du hachage

    const user = new User({
      email,
      password: hashedPassword, // Stocker le mot de passe haché
      username,
      nom,
      prenom,
      telephone,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation error", errors });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Comparer le mot de passe fourni avec le mot de passe haché
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "7d",
    });
    user.token = token;
    await user.save();

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({
        message: "An error occurred during login",
        error: error.message,
      });
  }
});
router.post("/change-password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Extract userId from the JWT token
    const token = req.headers.authorization.split(" ")[1]; // Remove "Bearer "
    const decodedToken = jwt.verify(token, "your_secret_key");
    const userId = decodedToken.userId;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Verify the old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
module.exports = router;
