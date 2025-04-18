import 'package:flutter/material.dart';
import 'package:tunisie_catering_front/presentation/pages/reclamation_detail_screen.dart';
import '../../data/models/reclamation.dart';
import '../../services/reclamation_service.dart';
import 'create_reclamation_screen.dart';


class ReclamationsScreen extends StatefulWidget {
  // ID fixe pour l'utilisateur
  static const String userId = "1";

  const ReclamationsScreen({Key? key}) : super(key: key);

  @override
  _ReclamationsScreenState createState() => _ReclamationsScreenState();
}

class _ReclamationsScreenState extends State<ReclamationsScreen> {
  final ReclamationService _reclamationService = ReclamationService();
  List<Reclamation> _reclamations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReclamations();

    // Configuration du WebSocket pour les mises à jour en temps réel
    _reclamationService.onNewReclamation = (reclamation) {
      if (reclamation.userId == ReclamationsScreen.userId) {
        setState(() {
          _reclamations.insert(0, reclamation);
        });
      }
    };
    _reclamationService.connectToWebSocket();
  }

  @override
  void dispose() {
    _reclamationService.dispose();
    super.dispose();
  }

  Future<void> _loadReclamations() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final reclamations = await _reclamationService.getUserReclamations(ReclamationsScreen.userId);
      setState(() {
        _reclamations = reclamations;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur lors du chargement des réclamations: $e')),
      );
    }
  }

  Future<void> _cancelReclamation(String id) async {
    try {
      final updatedReclamation = await _reclamationService.cancelReclamation(id);
      setState(() {
        final index = _reclamations.indexWhere((reclamation) => reclamation.id == id);
        if (index != -1) {
          _reclamations[index] = updatedReclamation;
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Réclamation annulée avec succès')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur lors de l\'annulation: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Mes Réclamations'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadReclamations,
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _reclamations.isEmpty
          ? Center(child: Text('Aucune réclamation trouvée'))
          : RefreshIndicator(
        onRefresh: _loadReclamations,
        child: ListView.builder(
          itemCount: _reclamations.length,
          itemBuilder: (context, index) {
            final reclamation = _reclamations[index];
            return Card(
              margin: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: ListTile(
                title: Text(
                  reclamation.objet,
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Commande: ${reclamation.numeroCommande}'),
                    Text('Statut: ${reclamation.statut}'),
                    Text('Date: ${_formatDate(reclamation.createdAt)}'),
                  ],
                ),
                trailing: reclamation.statut == 'en attente'
                    ? IconButton(
                  icon: Icon(Icons.cancel, color: Colors.red),
                  onPressed: () => _cancelReclamation(reclamation.id!),
                )
                    : null,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ReclamationDetailScreen(reclamation: reclamation),
                    ),
                  );
                },
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.add),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CreateReclamationScreen(),
              fullscreenDialog: true,
            ),
          ).then((_) => _loadReclamations());
        },
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
