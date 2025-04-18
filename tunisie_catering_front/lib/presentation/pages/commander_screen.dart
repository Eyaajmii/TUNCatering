import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tunisie_catering_front/data/models/meal.dart';
import 'package:tunisie_catering_front/presentation/providers/meal_provider.dart';

class CommanderScreen extends StatelessWidget {
  final List<Meal> selectedMeals;

  const CommanderScreen({Key? key, required this.selectedMeals}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<MealProvider>(context);
    final total = selectedMeals.fold(0.0, (sum, meal) => sum + meal.prix);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Votre commande'),
        backgroundColor: const Color(0xFFFF8C00),
      ),
      body: Column(
        children: [
          // Liste des repas sélectionnés
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: selectedMeals.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final meal = selectedMeals[index];
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        blurRadius: 6,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(30),
                      child: Image.network(
                        meal.image, // Assure-toi que meal.image existe et contient l'URL
                        width: 50,
                        height: 50,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => const Icon(Icons.fastfood),
                      ),
                    ),
                    title: Text(
                      meal.nom,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text('${meal.prix.toStringAsFixed(2)} DT'),
                    trailing: IconButton(
                      icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
                      onPressed: () => provider.removeSelectedMeal(meal.id),
                    ),
                  ),

                );
              },
            ),
          ),

          // Total + bouton de validation
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'Total: ${total.toStringAsFixed(2)} DT',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {
                    // TODO: Envoyer la commande
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Commander',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
