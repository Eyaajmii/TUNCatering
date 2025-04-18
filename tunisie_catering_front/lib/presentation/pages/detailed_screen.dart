import 'package:flutter/material.dart';
import 'package:tunisie_catering_front/data/models/meal.dart';

class DetailedScreen extends StatelessWidget {
  final Meal meal;
  final Color orangeDark = const Color(0xFFFF8C00); // Remplace lavender par orange foncé

  const DetailedScreen({Key? key, required this.meal}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(meal.nom),
        backgroundColor: orangeDark,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image in Card
            Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              margin: const EdgeInsets.symmetric(horizontal: 16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: SizedBox(
                  height: 300,
                  width: double.infinity,
                  child: meal.image.isNotEmpty
                      ? Image.network(
                    meal.image,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _buildPlaceholderImage(),
                  )
                      : _buildPlaceholderImage(),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Meal Type Section
            _buildSectionTitle('Type de plat:'),
            _buildSectionContent(meal.typePlat),
            const SizedBox(height: 20),

            // Price Section
            _buildSectionTitle('Prix:'),
            Padding(
              padding: const EdgeInsets.only(left: 10),
              child: Row(
                children: [
                  Image.asset(
                    'assets/icons/cash.png',
                    width: 20,
                    height: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${meal.prix.toStringAsFixed(2)} DT',
                    style: const TextStyle(fontSize: 16),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Description Section
            _buildSectionTitle('Description:'),
            _buildSectionContent(meal.description),
            const SizedBox(height: 20),

            // Availability Section
            _buildSectionTitle('Disponibilité:'),
            Padding(
              padding: const EdgeInsets.only(left: 10),
              child: Row(
                children: [
                  Image.asset(
                    meal.disponibilite
                        ? 'assets/icons/availabale.jpg'
                        : 'assets/icons/unaivalable.jpg',
                    width: 20,
                    height: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    meal.disponibilite ? 'Disponible' : 'Non disponible',
                    style: TextStyle(
                      fontSize: 16,
                      color: meal.disponibilite ? Colors.green : Colors.red,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: orangeDark,
            minimumSize: const Size(double.infinity, 50),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          onPressed: () {
            // Logique d'ajout au panier ici
          },
          child: const Text(
            'Ajouter au panier',
            style: TextStyle(fontSize: 18),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 10),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 18,
          color: orangeDark,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSectionContent(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 10, top: 4),
      child: Text(
        text,
        style: const TextStyle(fontSize: 16),
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      color: Colors.grey[200],
      child: Center(
        child: Icon(Icons.fastfood, size: 50, color: Colors.grey[400]),
      ),
    );
  }
}
