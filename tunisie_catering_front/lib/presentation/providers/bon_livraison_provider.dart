// lib/presentation/providers/bon_livraison_provider.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:tunisie_catering_front/data/models/bon_livraison.dart';

class BonLivraisonProvider extends ChangeNotifier {
  List<BonLivraison> _bonsLivraison = [];
  bool _isLoading = false;
  String _error = '';

  List<BonLivraison> get bonsLivraison => _bonsLivraison;
  bool get isLoading => _isLoading;
  String get error => _error;

  final String baseUrl = 'http://192.168.1.32:5000/api/bonLivraison';

  Future<void> fetchAllBonsLivraison() async {
    _isLoading = true;
    _error = '';
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('$baseUrl/all'));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] && data['data'] != null) {
          _bonsLivraison = List<BonLivraison>.from(
              data['data'].map((item) => BonLivraison.fromJson(item)));
        } else {
          _error = 'Aucun bon de livraison trouvé';
        }
      } else {
        _error = 'Erreur lors de la récupération des bons de livraison';
      }
    } catch (e) {
      _error = 'Erreur de connexion: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateBonLivraisonStatus(String id, String qrData) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/scan/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'qrData': qrData}),
      );

      if (response.statusCode == 200) {
        await fetchAllBonsLivraison();
        return true;
      } else {
        final errorData = json.decode(response.body);
        _error = errorData['message'] ?? 'Erreur lors de la mise à jour du statut';
        return false;
      }
    } catch (e) {
      _error = 'Erreur de connexion: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}