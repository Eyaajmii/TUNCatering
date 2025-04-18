// lib/data/models/bon_livraison.dart
class BonLivraison {
  final String id;
  final String numeroBon;
  final String statut;
  final String qrCodeImage;
  final String conformite;
  final String vol;

  BonLivraison({
    required this.id,
    required this.numeroBon,
    required this.statut,
    required this.qrCodeImage,
    required this.conformite,
    required this.vol,
  });

  factory BonLivraison.fromJson(Map<String, dynamic> json) {
    return BonLivraison(
      id: json['_id'],
      numeroBon: json['numeroBon'],
      statut: json['Statut'],
      qrCodeImage: json['qrCodeImage'] ?? '',
      conformite: json['conformite'],
      vol: json['vol'],
    );
  }
}