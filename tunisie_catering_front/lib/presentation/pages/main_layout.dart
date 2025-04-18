// lib/presentation/pages/main_layout.dart
import 'package:flutter/material.dart';
import 'package:tunisie_catering_front/presentation/pages/home_page.dart';
import 'package:tunisie_catering_front/presentation/pages/explorer_screen.dart';
import 'package:provider/provider.dart';
import 'package:tunisie_catering_front/presentation/pages/commander_screen.dart';
import 'package:tunisie_catering_front/presentation/providers/meal_provider.dart';
import 'package:tunisie_catering_front/presentation/pages/guide_screen.dart';
import 'package:tunisie_catering_front/presentation/pages/reclamations_screen.dart'; // Importer l'écran des réclamations

class MainLayout extends StatefulWidget {
  const MainLayout({Key? key}) : super(key: key);

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0; // Initialisé à 0 pour que "Explorer" soit la première page
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  static final List<Widget> _widgetOptions = <Widget>[
    const ExplorerScreen(), // "Explorer" est maintenant la première page
    const HomePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      drawer: _buildNavigationDrawer(),
      appBar: AppBar(
        title: const Text('Catering'),
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
      ),
      body: _widgetOptions.elementAt(_selectedIndex),
    );
  }

  Widget _buildNavigationDrawer() {
    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              alignment: Alignment.centerLeft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Catering',
                    style: TextStyle(
                      fontSize: 22,
                      color: Color(0xFFFF8C00),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 1,
                    color: const Color(0xFFFF8C00),
                  ),
                ],
              ),
            ),

            // Menu items (pas dans une ListView)
            _buildDrawerItem(
              icon: Icons.restaurant,
              title: 'Explorer',
              onTap: () {
                Navigator.pop(context);
                setState(() => _selectedIndex = 0);
              },
            ),
            _buildDrawerItem(
              icon: Icons.list_alt,
              title: 'Livraisons',
              onTap: () {
                Navigator.pop(context);
                setState(() => _selectedIndex = 1);
              },
            ),
            _buildDrawerItem(
              icon: Icons.shopping_cart,
              title: 'Commander',
              onTap: () {
                Navigator.pop(context);
                final selectedMeals = Provider.of<MealProvider>(context, listen: false).selectedMeals;
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CommanderScreen(selectedMeals: selectedMeals),
                  ),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.track_changes,
              title: 'Suivie Commande',
              onTap: () {
                Navigator.pop(context);
              },
            ),
            _buildDrawerItem(
              icon: Icons.report_problem,
              title: 'Réclamation',
              onTap: () {
                Navigator.pop(context);
                // Naviguer vers l'écran des réclamations
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ReclamationsScreen(),
                  ),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.history,
              title: 'Historique',
              onTap: () {
                Navigator.pop(context);
              },
            ),
            _buildDrawerItem(
              icon: Icons.account_circle,
              title: 'Comptes',
              onTap: () {
                Navigator.pop(context);
              },
            ),
            _buildDrawerItem(
              icon: Icons.help_outline,
              title: 'Guide',
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const GuideScreen()),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.settings,
              title: 'Settings',
              onTap: () {
                Navigator.pop(context);
              },
            ),

            const Spacer(),

            // Logout
            const Divider(),
            _buildDrawerItem(
              icon: Icons.logout,
              title: 'Logout',
              onTap: () {
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey[700]),
      title: Text(title),
      onTap: onTap,
    );
  }
}