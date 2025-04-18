import 'dart:convert';
import 'package:http/http.dart' as http;
import '../data/models/reclamation.dart';
import 'package:web_socket_channel/io.dart';

class ReclamationService {
  final String baseUrl = 'http://192.168.1.32:5000/api'; // Changez selon votre configuration
  final String wsUrl = 'ws://192.168.1.32:5000'; // URL WebSocket
  IOWebSocketChannel? _channel;
  Function(Reclamation)? onNewReclamation;

  // Se connecter au WebSocket
  void connectToWebSocket() {
    try {
      _channel = IOWebSocketChannel.connect(wsUrl);
      _channel!.stream.listen((message) {
        final data = jsonDecode(message);
        if (data['type'] == 'NEW_RECLAMATION' && onNewReclamation != null) {
          final reclamation = Reclamation.fromJson(data['data']);
          onNewReclamation!(reclamation);
        }
      }, onError: (error) {
        print('WebSocket error: $error');
        // Tentative de reconnexion après 5 secondes
        Future.delayed(Duration(seconds: 5), connectToWebSocket);
      }, onDone: () {
        print('WebSocket connection closed');
        // Tentative de reconnexion après 5 secondes
        Future.delayed(Duration(seconds: 5), connectToWebSocket);
      });
    } catch (e) {
      print('Failed to connect to WebSocket: $e');
      // Tentative de reconnexion après 5 secondes
      Future.delayed(Duration(seconds: 5), connectToWebSocket);
    }
  }

  void dispose() {
    _channel?.sink.close();
  }

  // Créer une réclamation
  Future<Reclamation> createReclamation(Reclamation reclamation) async {
    final response = await http.post(
      Uri.parse('$baseUrl/reclamations'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(reclamation.toJson()),
    );

    if (response.statusCode == 201) {
      return Reclamation.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Échec de la création de la réclamation: ${response.body}');
    }
  }

  // Récupérer les réclamations d'un utilisateur
  Future<List<Reclamation>> getUserReclamations(String userId) async {
    final response = await http.get(Uri.parse('$baseUrl/reclamations/user/$userId'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((item) => Reclamation.fromJson(item)).toList();
    } else if (response.statusCode == 404) {
      // Pas de réclamations trouvées
      return [];
    } else {
      throw Exception('Échec de la récupération des réclamations: ${response.body}');
    }
  }

  // Annuler une réclamation
  Future<Reclamation> cancelReclamation(String id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/reclamations/$id/cancel'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      return Reclamation.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Échec de l\'annulation de la réclamation: ${response.body}');
    }
  }
}