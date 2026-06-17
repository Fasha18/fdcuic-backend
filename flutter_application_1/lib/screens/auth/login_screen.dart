import 'package:flutter/material.dart';
import '../../widgets/auth_widgets.dart'; // ← un seul import
import '../../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez remplir tous les champs.')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await ApiService.login(email, password);
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientBackground(         // ← widget réutilisable
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 36),
              const FDLogo(),           // ← widget réutilisable
              const SizedBox(height: 32),
              Expanded(
                child: WhiteSheet(      // ← widget réutilisable
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(28, 32, 28, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Titre
                        const Text('Connexion',
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Color(0xFF0D1B4B))),
                        const SizedBox(height: 4),
                        Text('Accédez à votre espace candidat',
                          style: TextStyle(fontSize: 13, color: Colors.black.withValues(alpha: 0.45))),
                        const SizedBox(height: 28),

                        const FDLabel('Email'),         // ← widget réutilisable
                        const SizedBox(height: 6),
                        FDTextField(              // ← widget réutilisable
                          controller: _emailController,
                          hint: 'exemple@email.com',
                          icon: Icons.mail_outline_rounded,
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 16),

                        const FDLabel('Mot de passe'),
                        const SizedBox(height: 6),
                        FDPasswordField(
                          controller: _passwordController,
                        ),        // ← widget réutilisable
                        const SizedBox(height: 32),

                        FDButton(                       // ← widget réutilisable
                          label: 'Se connecter',
                          isLoading: _isLoading,
                          onTap: _login,
                        ),
                        const SizedBox(height: 24),

                        FDAuthLink(                     // ← widget réutilisable
                          question: 'Pas encore de compte ?',
                          linkText: "S'inscrire",
                          onTap: () => Navigator.pushNamed(context, '/register'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}