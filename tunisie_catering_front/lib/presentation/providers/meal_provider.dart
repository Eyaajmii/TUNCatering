import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:tunisie_catering_front/data/models/meal.dart';

class MealProvider extends ChangeNotifier {
  List<Meal> _meals = [];
  List<Meal> _selectedMeals = [];
  bool _isLoading = false;
  String _error = '';

  List<Meal> get meals => _meals;
  List<Meal> get selectedMeals => _selectedMeals;
  bool get isLoading => _isLoading;
  String get error => _error;

  static const String _baseUrl = 'http://192.168.1.32:5000/api/meal';

  Future<void> fetchMeals() async {
    _isLoading = true;
    _error = '';
    notifyListeners();

    try {
      final response = await http.get(
        Uri.parse(_baseUrl),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _meals = data.map((json) => Meal.fromJson(json)).toList();
      } else {
        _error = 'Erreur: ${response.statusCode}';
      }
    } catch (e) {
      _error = 'Erreur de connexion: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void addSelectedMeal(Meal meal, BuildContext context) {
    if (_selectedMeals.any((m) => m.typePlat == meal.typePlat)) {
      _showErrorDialog(context, 'Un seul plat par type autorisé');
      return;
    }

    _selectedMeals.add(meal);
    notifyListeners();
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Erreur'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  void removeSelectedMeal(String id) {
    _selectedMeals.removeWhere((meal) => meal.id == id);
    notifyListeners();
  }

  Future<bool> submitOrder() async {
    try {
      final response = await http.post(
        Uri.parse('http://192.168.1.32:5000/api/commande'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'meals': _selectedMeals.map((m) => m.id).toList(),
          'total': _selectedMeals.fold(0.0, (sum, m) => sum + m.prix),
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _selectedMeals.clear();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}