import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:tunisie_catering_front/data/models/reclamation.dart';

import '../../services/reclamation_service.dart';

class CreateReclamationScreen extends StatefulWidget {
  const CreateReclamationScreen({Key? key}) : super(key: key);

  @override
  _CreateReclamationScreenState createState() => _CreateReclamationScreenState();
}

class _CreateReclamationScreenState extends State<CreateReclamationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _numeroCommandeController = TextEditingController();
  final _objetController = TextEditingController();
  final _descriptionController = TextEditingController();

  final ReclamationService _reclamationService = ReclamationService();
  File? _image;
  bool _isSubmitting = false;

  // ID fixe pour l'utilisateur
  static const String userId = "507f1f77bcf86cd799439011";

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
      });
    }
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isSubmitting = true;
      });

      try {
        // Ici, vous devrez implémenter le chargement de l'image
        // vers votre serveur et récupérer l'URL
        String? imageUrl;

        // Création de la réclamation avec l'ID utilisateur fixe
        final reclamation = Reclamation(
          userId: userId,
          numeroCommande: _numeroCommandeController.text,
          objet: _objetController.text,
          description: _descriptionController.text,
          imageUrl: imageUrl,
        );

        await _reclamationService.createReclamation(reclamation);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Réclamation créée avec succès')),
        );

        Navigator.pop(context);
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur lors de la création: $e')),
        );
      } finally {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Nouvelle Réclamation'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _numeroCommandeController,
                decoration: InputDecoration(
                  labelText: 'Numéro de commande',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Veuillez entrer le numéro de commande';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16.0),
              TextFormField(
                controller: _objetController,
                decoration: InputDecoration(
                  labelText: 'Objet',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Veuillez entrer l\'objet de la réclamation';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16.0),
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 5,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Veuillez entrer une description';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16.0),
              ElevatedButton.icon(
                onPressed: _pickImage,
                icon: Icon(Icons.photo),
                label: Text('Ajouter une image'),
              ),
              if (_image != null) ...[
                SizedBox(height: 16.0),
                Image.file(
                  _image!,
                  height: 200,
                  fit: BoxFit.cover,
                ),
              ],
              SizedBox(height: 24.0),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitForm,
                child: _isSubmitting
                    ? CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(Colors.white))
                    : Text('Soumettre la réclamation'),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}