import 'package:flutter/material.dart';

import '../../main.dart';
import 'explorer_screen.dart';

class GuideScreen extends StatefulWidget {
  const GuideScreen({super.key});

  @override
  State<GuideScreen> createState() => _GuideScreenState();
}

class _GuideScreenState extends State<GuideScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  final List<Map<String, String>> guidePages = [
    {
      'image': 'assets/images/video.png',
      'title': 'Bienvenue',
      'desc': 'Découvrez nos services de catering aérien.',
    },
    {
      'image': 'assets/images/shorts.png',
      'title': 'Explorez',
      'desc': 'Choisissez vos repas parmi une large sélection.',
    },
    {
      'image': 'assets/images/live.png',
      'title': 'Commandez',
      'desc': 'Passez commande et suivez votre livraison.',
    },
  ];

  void _nextPage() {
    if (_currentPage < guidePages.length - 1) {
      _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      _finish();
    }
  }

  void _prevPage() {
    if (_currentPage > 0) {
      _controller.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
  }

  void _finish() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => MyApp ()), // Replace with your actual ExplorerScreen
    );
  }

  Widget _buildDot(int index) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      width: _currentPage == index ? 12 : 8,
      height: _currentPage == index ? 12 : 8,
      decoration: BoxDecoration(
        color: _currentPage == index ? Colors.deepPurple : Colors.grey,
        shape: BoxShape.circle,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            itemCount: guidePages.length,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemBuilder: (context, index) {
              final page = guidePages[index];
              return Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(page['image']!, height: 300),
                    const SizedBox(height: 24),
                    Text(page['title']!, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Text(page['desc']!, style: const TextStyle(fontSize: 16), textAlign: TextAlign.center),
                  ],
                ),
              );
            },
          ),
          Positioned(
            top: 50,
            right: 20,
            child: TextButton.icon(
              onPressed: _finish, // Skip button navigates to ExplorerScreen
              icon: const Icon(Icons.skip_next),
              label: const Text("Skip"),
              style: TextButton.styleFrom(foregroundColor: Colors.deepPurple),
            ),
          ),
          Positioned(
            bottom: 80,
            left: 20,
            child: Visibility(
              visible: _currentPage > 0,
              child: TextButton(
                onPressed: _prevPage,
                child: const Text("Back", style: TextStyle(fontSize: 16)),
              ),
            ),
          ),
          Positioned(
            bottom: 80,
            right: 20,
            child: TextButton(
              onPressed: _nextPage, // Next button
              child: Text(_currentPage == guidePages.length - 1 ? "Finish" : "Next", style: const TextStyle(fontSize: 16)),
            ),
          ),
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(guidePages.length, _buildDot),
            ),
          ),
        ],
      ),
    );
  }
}
