const BonLivraison = require("../models/bonLivraison");
const Vol = require("../models/vol");
const Commande = require("../models/Commande");
const user = require("../models/User");
const personnelTunisair = require("../models/PersonnelTunisairModel");
const PersonnelNavigant = require("../models/personnelnavigant");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const notification = require("../models/NotificationModel");
module.exports = function (
  broadcastNewBonLivraison,
  broadcastBonLivraisonStatusUpdate
) {
  async function generateBonLivraisonPDF(bonLivraison) {
    return new Promise(async (resolve, reject) => {
      try {
        const pdfDir = path.join(__dirname, "..", "public", "pdfs");
        if (!fs.existsSync(pdfDir)) {
          fs.mkdirSync(pdfDir, { recursive: true });
        }

        const fileName = `bon_livraison_${bonLivraison.numeroBon}.pdf`;
        const filePath = path.join(pdfDir, fileName);
        const pdfPath = `/pdfs/${fileName}`;

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // PDF Content
        doc.fontSize(20).text("Bon de Livraison", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Numéro: ${bonLivraison.numeroBon}`);
        doc.text(`Vol: ${bonLivraison.vol}`);
        doc.moveDown();

        // Add more content as needed
        doc.fontSize(12).text("Détails des commandes:", { underline: true });
        doc.moveDown(0.5);
        const bonWithCommandes = await BonLivraison.findById(
          bonLivraison._id
        ).populate("commandes");

        bonWithCommandes.commandes.forEach((commande, index) => {
          doc.text(`${index + 1}. Commande ${commande._id}`);
        });
        if (bonLivraison.qrCodeImage) {
          const qrImageBuffer = Buffer.from(
            bonLivraison.qrCodeImage.split(",")[1],
            "base64"
          );
          doc.addPage();
          doc.fontSize(16).text("QR Code associé :", { align: "center" });
          doc.image(qrImageBuffer, {
            fit: [200, 200],
            align: "center",
            valign: "center",
          });
        }

        doc.end();

        stream.on("finish", () => resolve(pdfPath));
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }
  const createBonLivraison = async (req, res) => {
    try {
      const {volId, commandes } = req.body;
      if (!volId || !commandes || commandes.length === 0) {
        return res.status(400).json({message: "Données manquantes ou invalides" });
      }
      const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const numeroBon = `BL-${randomPart}`;
      const vol = await Vol.findById(volId);
      if (!vol) {
        return res.status(404).json({ message: "Vol introuvable" });
      }
      const existingBonLivraison = await BonLivraison.findOne({
        vol: volId,
        Statut: { $ne: "Annulé" },
      });
      if (existingBonLivraison) {
        return res.status(400).json({message: "Un bon de livraison existant !",});
      }
      const commandesValides = await Promise.all(
        commandes.map((commandeId) => Commande.findById(commandeId))
      );

      if (commandesValides.some((c) => !c)) {
        return res.status(404).json({message: "Aucune commande existante",});
      }
      const hasEnAttenteOuRetard = commandesValides.some(
        (c) => c.Statut === "en attente" || c.Statut === "en retard"
      );
      if (hasEnAttenteOuRetard) {
        return res.status(400).json({message:"Impossible de créer le bon de livraison : au moins une commande est en statut 'En attente' ou 'En retard'",});
      }
      const commandesFiltrees = commandesValides.filter((c) => c.Statut !== "annulé").map((c) => c._id);
      const cmds = commandesFiltrees.map((id) => ({
        commande: id,
      }));
      const commandesDuVol = await Commande.find({ vol: vol._id });
      const matriculesCommandes = commandesDuVol.map((cmd) => cmd.Matricule);
      const personnelTunisairList = await personnelTunisair.find({
        Matricule: { $in: matriculesCommandes },
      });
      const personnelTunisairIds = personnelTunisairList.map((p) => p._id);
      const chefCabine = await PersonnelNavigant.findOne({PersonnelTunisiarId: { $in: personnelTunisairIds },TypePersonnel: "Chef de cabine",}).populate("PersonnelTunisiarId");

      const matriculeChef = chefCabine?.PersonnelTunisiarId?.Matricule || null;
      const newBonLivraison = new BonLivraison({
        numeroBon: numeroBon,
        vol: volId,
        commandes: cmds,
        personnelLivraison: matriculeChef,
        Statut: "En attente",
        conformite: "Non vérifié",
      });
      const qrData = `Bon de Livraison: ${numeroBon}`;
      const qrCodeImage = await QRCode.toDataURL(qrData);
      newBonLivraison.qrCodeImage = qrCodeImage;
      await newBonLivraison.save();

      // Generate PDF after saving
      const pdfPath = await generateBonLivraisonPDF(newBonLivraison);
      newBonLivraison.pdfPath = pdfPath;
      await newBonLivraison.save();
      const notifcreer = await notification.create({
        message: `Nouvelle bon de livraison créé`,
        emetteur: "tunisie_catering",
        destinataire: matriculeChef,
        notificationType: "new_bonLivraison",
      });
      global.io.to(matriculeChef).emit("newNotification", {
        ...notifcreer._doc,
        destinataire: matriculeChef,
      });
      broadcastNewBonLivraison({
        ...newBonLivraison._doc,
        type: "BonLivraison ",
        items: [{ newBonLivraison, quantite: 1 }],
      });
      res.status(201).json({message: "Bon de livraison créé avec succès !", data: newBonLivraison,});
    } catch (error) {
      res.status(500).json({message: error.message,});
    }
  };

  const getBonLivraisonById = async (req, res) => {
    try {
      const { id } = req.params;
      const bonLivraison = await BonLivraison.findById(id)
        .populate({
          path: "commandes.commande",
          populate: [
            { path: "menu", model: "Menu" },
            { path: "plats", model: "Plat" },
          ],
        })
        .populate("vol")
        .populate("personnelLivraison");

      if (!bonLivraison) {
        return res
          .status(404)
          .json({ success: false, message: "Bon de livraison introuvable." });
      }

      res.status(200).json(bonLivraison);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du bon de livraison :",
        error
      );
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  };
  const scanBonLivraison = async (req, res) => {
    try {
      const { id } = req.params;
      const { qrData } = req.body;

      const bonLivraison = await BonLivraison.findById(id);

      if (!bonLivraison) {
        return res
          .status(404)
          .json({ success: false, message: "Bon non trouvé" });
      }

      // Vérification du QR code
      const expectedQR = `Bon de Livraison: ${bonLivraison.numeroBon}`;
      if (qrData !== expectedQR) {
        return res
          .status(400)
          .json({ success: false, message: "QR Code invalide" });
      }

      bonLivraison.Statut = "Validé";
      bonLivraison.conformite = "Confirmé";
      bonLivraison.personnelLivraison = req.user.Matricule;
      bonLivraison.dateLivraison = new Date();
      await bonLivraison.save();

      res.status(200).json({ success: true, data: bonLivraison });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  const updateStatutBonLivraison = async (req, res) => {
    try {
      const { id } = req.params;
      const { confirmerConformite, commandesConfirmées,Commantaire } = req.body;
      const bn = await BonLivraison.findById(id).populate("commandes.commande").populate('vol');
      if (!bn)
        return res
          .status(404)
          .json({ message: "Bon de livraison introuvable" });
      //confirmation manuelle des commandes
      if (
        Array.isArray(commandesConfirmées) &&
        commandesConfirmées.length > 0
      ) {
        bn.commandes.forEach((cmd) => {
          if (commandesConfirmées.includes(String(cmd.commande._id))) {
            cmd.confirme = true;
          }
        });
      }
      //confirmation globale => toutes les commandes confirmées
      if (confirmerConformite === true) {
        bn.commandes.forEach((cmd) => {
          cmd.confirme = true;
        });
      }
      const auMoinsUneConfirme = bn.commandes.some((c) => c.confirme === true);
      if (auMoinsUneConfirme) {
        bn.conformite = "Confirmé";
        bn.Statut = "Validé";
      }
      if (Commantaire) {
        bn.Commantaire = Commantaire;
      }
      await bn.save();
      if (bn.Statut === "Validé") {
        for (const c of bn.commandes) {
          if (c.commande && c.commande._id) {
            await Commande.findByIdAndUpdate(c.commande._id, {
              Statut: "livré",
            });
          }
        }
      }
      const notifcreer = await notification.create({
        message: `Statut du bon de livraison a été modifié en ${bn.Statut}`,
        emetteur: bn.personnelLivraison,
        destinataire: "tunisie_catering",
        notificationType: "statut_bonLivraison",
      });
      global.io.to("tunisie_catering").emit("newNotification", {
        ...notifcreer._doc,
        destinataire: "tunisie_catering",
      });
      broadcastBonLivraisonStatusUpdate({
        // ...notifcreer._doc,
        ...bn._doc,
        type: "BonLivraison ",
        items: [{ bn, quantite: 1 }],
        //destinataire: "tunisie_catering",
        bnId: bn._id,
        Statut: bn.Statut,
        conformite:bn.conformite,
      });
      res.status(200).json({
        success: true,
        message: "Statut et conformité mis à jour",
        data: bn,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  };

  //par tunisie catering
  const updateBonLivraison = async (req, res) => {
    try {
      const { id } = req.params;
      const bn = await BonLivraison.findById(id)
        .populate({
          path: "commandes.commande",
          populate: [
            { path: "menu", model: "Menu" },
            { path: "plats", model: "Plat" },
          ],
        })
        .populate("vol")
        .populate("personnelLivraison");
      if (!bn) {
        return res.status(404).json({message: "Bon de livraison non trouvé" });
      }
      if (bn.Statut !== "En attente") {
        return res.status(400).json({message:"Modification interdit ! ",});
      }
      await BonLivraison.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json({message: "Bon de livraison mis à jour avec succès"});
    } catch (err) {
      res.status(500).json({ message: "Erreur" });
    }
  };
  const getAllBonsLivraisons = async (req, res) => {
    try {
      const bnlivs = await BonLivraison.find().populate('vol');
      res.status(200).json(bnlivs);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  };
  const AnnulerBn = async (req, res) => {
    try {
      const { id } = req.params;
      const bn = await BonLivraison.findById(id);
      if (!bn) {
        return res
          .status(404)
          .json({ success: false, message: "Bon de livraison non trouvé" });
      }
      if (bn.Statut !== "En attente") {
        return res.status(400).json({
          success: false,
          message:
            "Le bon de livraison ne peut être annulé que s'il est en attente",
        });
      }
      bn.Statut = "Annulé";
      bn.conformite = "Non confirmé";
      await bn.save();
    } catch (err) {
      if (err.message === "bon livraison not found") {
        return res.status(404).send("Facture introuvable.");
      }
      if (
        err.message ===
        "Seules les bons de livraison en attente peuvent être annulées"
      ) {
        return res.status(400).send(err.message);
      }
      console.error("Erreur interne:", err);
      res.status(500).send("Erreur interne du serveur.");
    }
  };
const consulterBonsParChef = async (req, res) => {
  try {
    const Matricule = req.user.Matricule;
    const bons = await BonLivraison.find({ personnelLivraison:Matricule}).populate('vol');
    res.status(200).json(bons);
  } catch (error) {
    console.error("Erreur dans la consultation pour chef de cabine :", error);
    res.status(500).json({success: false,message: "Erreur serveur",error: error.message});
  }
};
  return {
    createBonLivraison,
    getBonLivraisonById,
    scanBonLivraison,
    updateStatutBonLivraison,
    updateBonLivraison,
    getAllBonsLivraisons,
    AnnulerBn,
    consulterBonsParChef,
  };
};
