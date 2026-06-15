import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6), // Fond du light panel
      body: Stack(
        children: [
          // --- Recessed Inner Shadow Effect pour le fond clair ---
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.black.withOpacity(0.04),
                    Colors.transparent,
                    Colors.white.withOpacity(0.8),
                  ],
                  stops: const [0.0, 0.4, 1.0],
                ),
              ),
            ),
          ),

          // --- Left/Top Panel (Dark mode, elevated) ---
          Positioned.fill(
            child: CustomPaint(
              painter: DarkPanelPainter(),
            ),
          ),

          // --- Dividing Curve Shimmer Effect ---
          Positioned.fill(
            child: CustomPaint(
              painter: ShimmerDividerPainter(),
            ),
          ),

          // --- Custom Bottom Navigation Bar ---
          Positioned(
            bottom: 60, // Espacement depuis le bas de l'écran
            left: 0,
            right: 0,
            child: Center(
              child: SizedBox(
                width: 390,
                height: 70,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // 1. Forme de la Navbar avec ombre (pill shape + notch)
                    Positioned.fill(
                      child: CustomPaint(
                        painter: CustomNavBarPainter(),
                      ),
                    ),
                    
                    // 2. Icônes de navigation (2 à gauche, 2 à droite)
                    Positioned.fill(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildNavIcon(Icons.home_outlined),
                          _buildNavIcon(Icons.search_outlined),
                          const SizedBox(width: 80), // Espace central pour le FAB
                          _buildNavIcon(Icons.favorite_border_outlined),
                          _buildNavIcon(Icons.person_outline),
                        ],
                      ),
                    ),
                    
                    // 3. Bouton FAB Flottant
                    Positioned(
                      top: -25, // 25px au-dessus du bord supérieur de la navbar
                      left: (390 - 60) / 2, // Centré horizontalement
                      child: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            // Halo violet/lavande extérieur
                            BoxShadow(
                              color: const Color(0xFF7C3AED).withOpacity(0.25),
                              blurRadius: 15,
                              spreadRadius: 5,
                            ),
                            // Ombre portée standard
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.add,
                          color: Color(0xFF7C3AED), // Violet moyen
                          size: 30,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavIcon(IconData icon) {
    return SizedBox(
      width: 50,
      height: 50,
      child: Center(
        child: Icon(icon, color: const Color(0xFF7C3AED), size: 28),
      ),
    );
  }
}

class DarkPanelPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    // La partie "haute" de la courbe est un peu descendue (0.30 au lieu de 0.25)
    path.lineTo(0, size.height * 0.30);
    
    // Smooth organic S-curve
    path.cubicTo(
      size.width * 0.4, size.height * 0.30,
      // La partie "basse" de la courbe est remontée (0.40 au lieu de 0.50)
      size.width * 0.6, size.height * 0.40,
      size.width, size.height * 0.40,
    );
    path.lineTo(size.width, 0);
    path.close();

    // 1. Drop shadow for 3D depth (floating effect)
    canvas.drawShadow(path, Colors.black, 20.0, true);
    
    // Extra colored shadow to boost depth
    canvas.drawShadow(path, const Color(0xFF0F172A).withOpacity(0.8), 10.0, true);

    // 2. Deep navy blue gradient
    final gradientPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Color(0xFF1E293B), // Deep navy
          Color(0xFF0F172A), // Darker navy
          Color(0xFF020617), // Near black blue
        ],
        stops: [0.0, 0.6, 1.0],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawPath(path, gradientPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class ShimmerDividerPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final borderPath = Path();
    borderPath.moveTo(0, size.height * 0.30);
    borderPath.cubicTo(
      size.width * 0.4, size.height * 0.30,
      size.width * 0.6, size.height * 0.40,
      size.width, size.height * 0.40,
    );

    // 1. Soft glow behind the rim
    canvas.drawPath(
      borderPath,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6.0
        ..color = Colors.white.withOpacity(0.15)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4.0),
    );

    // 2. Thick shimmer base gradient
    final baseShimmer = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..shader = LinearGradient(
        colors: [
          Colors.white.withOpacity(0.8),
          Colors.white.withOpacity(0.1),
          Colors.white.withOpacity(0.8),
        ],
      ).createShader(Rect.fromLTWH(0, size.height * 0.30, size.width, size.height * 0.20));

    // 3. Thin sharp highlight (glossy rim light)
    final sharpHighlight = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0
      ..shader = LinearGradient(
        colors: [
          Colors.white,
          Colors.transparent,
          Colors.white,
        ],
      ).createShader(Rect.fromLTWH(0, size.height * 0.30, size.width, size.height * 0.20));

    canvas.drawPath(borderPath, baseShimmer);
    canvas.drawPath(borderPath, sharpHighlight);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class CustomNavBarPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    Paint paint = Paint()
      ..color = const Color(0xFFF3F0FF) // Blanc doux / légère teinte lavande
      ..style = PaintingStyle.fill;

    Path path = Path();
    final double w = size.width;
    final double h = size.height; // 70
    final double r = 35.0; // Moitié de la hauteur pour les bords en pilule

    path.moveTo(r, 0);
    // Bord supérieur gauche jusqu'à l'encoche
    path.lineTo(w / 2 - 55, 0);
    
    // Encoche douce (notch) pour le FAB
    path.cubicTo(
      w / 2 - 25, 0,
      w / 2 - 40, 38,
      w / 2, 38, // Centre du creux
    );
    path.cubicTo(
      w / 2 + 40, 38,
      w / 2 + 25, 0,
      w / 2 + 55, 0,
    );
    
    // Bord supérieur droit
    path.lineTo(w - r, 0);
    
    // Courbe droite
    path.arcToPoint(Offset(w, r), radius: Radius.circular(r), clockwise: true);
    path.lineTo(w, h - r);
    path.arcToPoint(Offset(w - r, h), radius: Radius.circular(r), clockwise: true);
    
    // Bord inférieur
    path.lineTo(r, h);
    
    // Courbe gauche
    path.arcToPoint(Offset(0, h - r), radius: Radius.circular(r), clockwise: true);
    path.lineTo(0, r);
    path.arcToPoint(Offset(r, 0), radius: Radius.circular(r), clockwise: true);
    
    path.close();

    // Ombre sous la barre de navigation
    canvas.drawShadow(path, Colors.black.withOpacity(0.15), 15.0, true);
    // Ombre subtile teintée
    canvas.drawShadow(path, const Color(0xFF7C3AED).withOpacity(0.05), 20.0, true);
    
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

