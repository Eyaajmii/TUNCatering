class Reclamation {
  final String? id;
  final String userId;
  final String numeroCommande;
  final String objet;
  final String description;
  final String? imageUrl;
  final String statut;
  final DateTime createdAt;

  Reclamation({
    this.id,
    required this.userId,
    required this.numeroCommande,
    required this.objet,
    required this.description,
    this.imageUrl,
    this.statut = 'en attente',
    DateTime? createdAt,
  }) : this.createdAt = createdAt ?? DateTime.now();

  factory Reclamation.fromJson(Map<String, dynamic> json) {
    return Reclamation(
      id: json['_id'],
      userId: json['userId'],
      numeroCommande: json['numeroCommande'],
      objet: json['objet'],
      description: json['description'],
      imageUrl: json['imageUrl'],
      statut: json['statut'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'numeroCommande': numeroCommande,
      'objet': objet,
      'description': description,
      'imageUrl': imageUrl,
      'statut': statut,
    };
  }
}