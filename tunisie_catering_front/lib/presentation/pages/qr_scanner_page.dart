// lib/presentation/pages/qr_scanner_page.dart
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import 'package:tunisie_catering_front/presentation/providers/bon_livraison_provider.dart';

class QRScannerPage extends StatefulWidget {
  final String? preSelectedBonId;

  const QRScannerPage({Key? key, this.preSelectedBonId}) : super(key: key);

  @override
  _QRScannerPageState createState() => _QRScannerPageState();
}

class _QRScannerPageState extends State<QRScannerPage> {
  MobileScannerController controller = MobileScannerController();
  bool isProcessing = false;
  String? lastScannedCode;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void _processScannedCode(String qrData, BuildContext context) async {
    if (isProcessing || qrData == lastScannedCode) return;

    setState(() {
      isProcessing = true;
      lastScannedCode = qrData;
    });

    String bonId = widget.preSelectedBonId ?? '';
    if (bonId.isEmpty) {
      final expectedPrefix = 'Bon de Livraison: ';
      if (qrData.startsWith(expectedPrefix)) {
        final numeroBon = qrData.substring(expectedPrefix.length);
        final provider = Provider.of<BonLivraisonProvider>(context, listen: false);
        for (var bon in provider.bonsLivraison) {
          if (bon.numeroBon == numeroBon) {
            bonId = bon.id;
            break;
          }
        }
      }
    }

    if (bonId.isNotEmpty) {
      final result = await Provider.of<BonLivraisonProvider>(context, listen: false)
          .updateBonLivraisonStatus(bonId, qrData);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result
                ? 'Statut mis à jour avec succès!'
                : 'Erreur: ${Provider.of<BonLivraisonProvider>(context, listen: false).error}',
          ),
          backgroundColor: result ? Colors.green : Colors.red,
        ),
      );

      if (result) Navigator.pop(context);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('QR Code invalide ou bon de livraison non trouvé'),
          backgroundColor: Colors.orange,
        ),
      );
    }

    setState(() => isProcessing = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scanner QR Code'),
        actions: [
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: controller.torchState,
              builder: (context, state, child) {
                return Icon(
                  state == TorchState.off ? Icons.flash_off : Icons.flash_on,
                );
              },
            ),
            onPressed: () => controller.toggleTorch(),
          ),
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: controller.cameraFacingState,
              builder: (context, state, child) {
                return Icon(
                  state == CameraFacing.front
                      ? Icons.camera_front
                      : Icons.camera_rear,
                );
              },
            ),
            onPressed: () => controller.switchCamera(),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: MobileScanner(
              controller: controller,
              onDetect: (capture) {
                final List<Barcode> barcodes = capture.barcodes;
                for (final barcode in barcodes) {
                  if (barcode.rawValue != null) {
                    _processScannedCode(barcode.rawValue!, context);
                  }
                }
              },
            ),
          ),
          Container(
            color: Colors.black54,
            padding: const EdgeInsets.all(16),
            child: const Text(
              'Positionnez le QR code à l\'intérieur du cadre',
              style: TextStyle(color: Colors.white),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}