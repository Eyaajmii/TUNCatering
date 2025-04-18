// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tunisie_catering_front/presentation/providers/bon_livraison_provider.dart';
import 'package:tunisie_catering_front/presentation/providers/meal_provider.dart';
import 'package:tunisie_catering_front/presentation/pages/main_layout.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => BonLivraisonProvider()),
        ChangeNotifierProvider(create: (context) => MealProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tunisie Catering',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const MainLayout(), // This is now the entry point
      debugShowCheckedModeBanner: false,
    );
  }
}