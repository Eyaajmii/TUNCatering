import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tunisie_catering_front/presentation/providers/meal_provider.dart';
import 'package:tunisie_catering_front/core/widgets/meal_card.dart';
import 'package:tunisie_catering_front/presentation/pages/detailed_screen.dart';
import 'package:tunisie_catering_front/presentation/pages/commander_screen.dart';

class ExplorerScreen extends StatefulWidget {
  const ExplorerScreen({Key? key}) : super(key: key);

  @override
  State<ExplorerScreen> createState() => _ExplorerScreenState();
}

class _ExplorerScreenState extends State<ExplorerScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<MealProvider>(context, listen: false).fetchMeals();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: Consumer<MealProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error.isNotEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(provider.error),
                  ElevatedButton(
                    onPressed: () => provider.fetchMeals(),
                    child: const Text('Réessayer'),
                  ),
                ],
              ),
            );
          }

          if (provider.meals.isEmpty) {
            return const Center(child: Text('Aucun plat disponible'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: provider.meals.length,
            itemBuilder: (context, index) {
              final meal = provider.meals[index];
              return MealCard(
                meal: meal,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => DetailedScreen(meal: meal),
                  ),
                ),
                onAdd: () => Provider.of<MealProvider>(context, listen: false).addSelectedMeal(meal, context),
              );
            },
          );
        },
      ),
      floatingActionButton: Consumer<MealProvider>(
        builder: (context, provider, _) {
          if (provider.selectedMeals.isEmpty) return const SizedBox();

          return Stack(
            alignment: Alignment.topRight,
            children: [
              FloatingActionButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CommanderScreen(
                      selectedMeals: provider.selectedMeals,
                    ),
                  ),
                ),
                backgroundColor: Colors.white,
                child: const Icon(Icons.shopping_cart, color: Colors.black),
              ),
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(5),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 24,
                    minHeight: 24,
                  ),
                  child: Text(
                    provider.selectedMeals.length.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          );
        },
      ),


      floatingActionButtonLocation: FloatingActionButtonLocation.endDocked,
    );
  }
}