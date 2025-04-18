// lib/presentation/pages/home_page.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tunisie_catering_front/presentation/providers/bon_livraison_provider.dart';
import 'package:tunisie_catering_front/presentation/pages/bon_details_page.dart';
import 'package:tunisie_catering_front/presentation/pages/qr_scanner_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<BonLivraisonProvider>(context, listen: false)
          .fetchAllBonsLivraison();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bons de Livraison'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              Provider.of<BonLivraisonProvider>(context, listen: false)
                  .fetchAllBonsLivraison();
            },
          ),
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const QRScannerPage(),
                ),
              );
            },
          ),
        ],
      ),
      body: Consumer<BonLivraisonProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error.isNotEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    provider.error,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => provider.fetchAllBonsLivraison(),
                    child: const Text('Réessayer'),
                  ),
                ],
              ),
            );
          }

          if (provider.bonsLivraison.isEmpty) {
            return const Center(
              child: Text('Aucun bon de livraison disponible'),
            );
          }

          return ListView.builder(
            itemCount: provider.bonsLivraison.length,
            itemBuilder: (context, index) {
              final bon = provider.bonsLivraison[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                elevation: 3,
                child: ListTile(
                  title: Text('Bon N°: ${bon.numeroBon}'),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Vol: ${bon.vol}'),
                      Text('Statut: ${bon.statut}'),
                      Text('Conformité: ${bon.conformite}'),
                    ],
                  ),
                  trailing: ElevatedButton(
                    child: const Text('Détails'),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BonDetailsPage(bon: bon),
                        ),
                      );
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}