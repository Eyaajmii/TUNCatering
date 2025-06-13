const bcrypt = require("bcrypt");
const user = require("../models/User");
const userTunisair=require("../models/PersonnelTunisairModel");
const pn = require("../models/personnelnavigant");
const pnTunisieCatering = require("../models/AdminTunCatering");
const pnDirectionCatering = require("../models/PersonnelTunDirCatering");
const pnDirectionPersonnel = require("../models/personnelDirPersonnel");
const admin = require("../models/adminModel");
const { generateAccesToken } = require("../middlware/auth");

class AuthController {
  static async register(
    username,
    password,
    email,
    nom,
    prenom,
    telephone,
    role,
    Matricule,
    roleTunisair,
    TypePersonnel
  ) {
    try {
      const existUser = await user.findOne({ username });
      if (existUser) {
        throw new Error("Utilisateur déja existe");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newuser = await user.create({
        username,
        password: hashedPassword,
        email,
        nom,
        prenom,
        telephone,
        role,
      });
      if (role == "Personnel Tunisair") {
        const personnelTunisair = await userTunisair.create({
          userId: newuser._id,
          Matricule,
          roleTunisair,
        });
        if (roleTunisair == "Personnel navigant") {
          await pn.create({
            PersonnelTunisiarId: personnelTunisair._id,
            TypePersonnel,
          });
        } else if (
          roleTunisair == "Personnel de Direction du Catering Tunisiar"
        ) {
          await pnDirectionCatering.create({
            PersonnelTunisiarId: personnelTunisair._id,
          });
        } else if (
          roleTunisair == "Personnel de Direction du Personnel Tunisiar"
        ) {
          await pnDirectionPersonnel.create({
            PersonnelTunisiarId: personnelTunisair._id,
          });
        }
      } else if (role == "Personnel Tunisie Catering") {
        await pnTunisieCatering.create({
          userId: newuser._id,
        });
      } else if (role == "Administrateur") {
        await admin.create({
          userId: newuser._id,
        });
      }
      return newuser;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  static async login(username, password) {
    try {
      const Finduser = await user.findOne({ username });
      if (!Finduser) {
        throw new Error("Utilisateur non trouvé");
      }
      const isValidPassword = await bcrypt.compare(password, Finduser.password);
      if (!isValidPassword) {
        throw new Error("Mot de passe incorrect");
      }
      let TypePersonnel = null;
      let Matricule = null;
      let roleTunisair = null;
      if (
        Finduser.role === "Personnel Tunisair" ||
        Finduser.role === "Personnel navigant"
      ) {
        const personnelTunisair = await userTunisair.findOne({
          userId: Finduser._id,
        });
        if (personnelTunisair) {
          roleTunisair = personnelTunisair.roleTunisair;
          Matricule = personnelTunisair.Matricule;
        } else {
          console.log("No personnelTunisair record found for user");
        }
        const pnData = await pn.findOne({
          PersonnelTunisiarId: personnelTunisair._id,
        });
        if (pnData) {
          TypePersonnel = pnData.TypePersonnel;
          if (!Matricule) Matricule = pnData.Matricule;
          console.log("Personnel navigant data:", pnData);
        }
      } else {
        console.log("No additional data fetched for role:", Finduser.role);
      }

      console.log("Final token data:", {
        username: Finduser.username,
        role: Finduser.role,
        TypePersonnel,
        Matricule,
        roleTunisair,
        email: Finduser.email,
      });

      const token = generateAccesToken(
        Finduser.username,
        Finduser.role,
        TypePersonnel,
        Matricule,
        roleTunisair,
        Finduser.email,
        Finduser._id.toString()
      );

      return {
        token,
        user: {
          _id: Finduser._id,
          username: Finduser.username,
          role: Finduser.role,
          Matricule,
          roleTunisair,
          TypePersonnel,
          email: Finduser.email,
        },
      };
    } catch (err) {
      throw new Error(err.message || "Erreur lors de la connexion");
    }
  }
  static async updateUserInfo(id, data) {
    try {
      const updateData = {};

      if (data.nom) updateData.nom = data.nom;
      if (data.prenom) updateData.prenom = data.prenom;
      if (data.email) updateData.email = data.email;
      if (data.telephone) updateData.telephone = data.telephone;
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        updateData.password = hashedPassword;
      }
      const updatedUser = await user.findByIdAndUpdate(id, updateData, {new: true,});
      return updatedUser;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  static async consulterUser() {
    try {
      const users = await user.find().populate({path: "personneltunisair",populate: {path: "navigant",},});
      return users;
    } catch (err) {
      throw new Error(
        "Erreur lors de la consultation des utilisateurs : " + err.message
      );
    }
  }

  static async supprimerUser(id) {
    try {
      const userSupprime = await user.findByIdAndDelete(id);
      if (!userSupprime) {
        throw new Error("Utilisateur introuvable.");
      }
      const personnel = await userTunisair.findOneAndDelete({ userId: id });
      if (personnel) {
        await pn.findOneAndDelete({ PersonnelTunisiarId: personnel._id });
      }

      return {
        message: "Utilisateur et données associées supprimés avec succès.",
      };
    } catch (err) {
      throw new Error(
        "Erreur lors de la suppression complète : " + err.message
      );
    }
  }
}
module.exports = AuthController;
