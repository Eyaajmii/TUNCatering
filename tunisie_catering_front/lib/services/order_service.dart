// lib/services/order_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../data/models/meal.dart';

class OrderService {
  static const String _baseUrl = 'http://192.168.1.32:5000/api';

  static Future<bool> submitOrder(List<Meal> meals) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/commande'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'meals': meals.map((m) => m.id).toList(),
          'total': meals.fold(0.0, (sum, m) => sum + m.prix),
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }
}