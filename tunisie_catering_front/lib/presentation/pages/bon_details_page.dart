// lib/presentation/pages/bon_details_page.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import 'package:tunisie_catering_front/data/models/bon_livraison.dart';
import 'package:tunisie_catering_front/presentation/providers/bon_livraison_provider.dart';
import 'package:tunisie_catering_front/presentation/pages/qr_scanner_page.dart';
import 'package:tunisie_catering_front/core/widgets/info_row.dart';

class BonDetailsPage extends StatelessWidget {
  final BonLivraison bon;

  const BonDetailsPage({Key? key, required this.bon}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget qrImage;
    try {
      if (bon.qrCodeImage.isNotEmpty) {
        final parts = bon.qrCodeImage.split(',');
        final base64Image = parts.length > 1 ? parts[1] : bon.qrCodeImage;
        qrImage = Image.memory(
          base64Decode(base64Image),
          width: 250,
          height: 250,
        );
      } else {
        qrImage = const Center(
          child: Text('QR Code non disponible'),
        );
      }
    } catch (e) {
      qrImage = Center(
        child: Text('Erreur de décodage QR: $e'),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Bon N°: ${bon.numeroBon}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Détails du Bon de Livraison:',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    InfoRow(label: 'Numéro du Bon:', value: bon.numeroBon),
                    InfoRow(label: 'Vol:', value: bon.vol),
                    InfoRow(label: 'Statut:', value: bon.statut),
                    InfoRow(label: 'Conformité:', value: bon.conformite),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              'QR Code:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 15),
            Center(
              child: Card(
                elevation: 5,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: qrImage,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Center(
              child: Column(
                children: [
                  ElevatedButton.icon(
                    icon: const Icon(Icons.check_circle),
                    label: const Text('Valider directement'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                    ),
                    onPressed: () {
                      final qrData = 'Bon de Livraison: ${bon.numeroBon}';
                      Provider.of<BonLivraisonProvider>(context, listen: false)
                          .updateBonLivraisonStatus(bon.id, qrData)
                          .then((success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              success
                                  ? 'Bon de livraison validé avec succès!'
                                  : 'Erreur: ${Provider.of<BonLivraisonProvider>(context, listen: false).error}',
                            ),
                            backgroundColor: success ? Colors.green : Colors.red,
                          ),
                        );
                        if (success) Navigator.pop(context);
                      });
                    },
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text('Scanner avec caméra'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => QRScannerPage(preSelectedBonId: bon.id),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}