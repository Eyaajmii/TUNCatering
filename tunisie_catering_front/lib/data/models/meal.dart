// lib/data/models/meal.dart
class Meal {
  final String id;
  final String nom;
  final String description;
  final double prix;
  final String typePlat;
  final String categorie;
  final bool disponibilite;
  final int quantite;
  final String image;

  Meal({
    required this.id,
    required this.nom,
    required this.description,
    required this.prix,
    required this.typePlat,
    required this.categorie,
    required this.disponibilite,
    required this.quantite,
    required this.image,
  });

  factory Meal.fromJson(Map<String, dynamic> json) {
    // Récupérez la valeur brute du champ image
    final String rawImage = json['image'] ?? '';

    // Construisez l'URL complète uniquement si l'image existe
    final String imageUrl = rawImage.isNotEmpty
        ? 'http://192.168.1.32:5000/uploads/$rawImage'
        : '';


    return Meal(
      id: json['_id'],
      nom: json['nom'],
      description: json['description'],
      prix: json['prix'].toDouble(),
      typePlat: json['typePlat'],
      categorie: json['Categorie'],
      disponibilite: json['Disponibilite'],
      quantite: json['quantite'],
      image: imageUrl,
    );
  }
}