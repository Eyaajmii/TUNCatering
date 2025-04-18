import 'package:flutter/material.dart';
import 'package:tunisie_catering_front/data/models/reclamation.dart';

class ReclamationDetailScreen extends StatelessWidget {
  final Reclamation reclamation;

  const ReclamationDetailScreen({Key? key, required this.reclamation}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Détail de la réclamation'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      reclamation.objet,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 8.0),
                    _buildInfoRow('Numéro de commande', reclamation.numeroCommande),
                    _buildInfoRow('Statut', reclamation.statut),
                    _buildInfoRow('Date de création', _formatDate(reclamation.createdAt)),
                    SizedBox(height: 16.0),
                    Text(
                      'Description:',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      reclamation.description,
                      style: TextStyle(fontSize: 16),
                    ),
                    if (reclamation.imageUrl != null && reclamation.imageUrl!.isNotEmpty) ...[
                      SizedBox(height: 16.0),
                      Text(
                        'Image:',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8.0),
                      Image.network(
                        reclamation.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Text('Erreur de chargement de l\'image');
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$label: ',
            style: TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
