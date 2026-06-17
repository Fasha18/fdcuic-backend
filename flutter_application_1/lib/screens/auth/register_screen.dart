import 'package:flutter/material.dart';
import '../../widgets/auth_widgets.dart';
import '../../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nomController = TextEditingController();
  final _prenomController = TextEditingController();
  final _telController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isLoading = false;

  Future<void> _register() async {
    final nom = _nomController.text.trim();
    final prenom = _prenomController.text.trim();
    final tel = _telController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final confirm = _confirmController.text.trim();

    if (nom.isEmpty || prenom.isEmpty || tel.isEmpty || email.isEmpty || password.isEmpty || confirm.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez remplir tous les champs.')),
      );
      return;
    }

    if (password != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Les mots de passe ne correspondent pas.')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final res = await ApiService.register({
        'nom': nom,
        'prenom': prenom,
        'telephone': tel,
        'email': email,
        'mot_de_passe': password,
        'confirmation_mot_de_passe': confirm,
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['message'] ?? 'Inscription réussie !'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pushReplacementNamed(context, '/login');
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
    _nomController.dispose();
    _prenomController.dispose();
    _telController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientBackground(
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 28),
              const FDLogo(size: 64),
              const SizedBox(height: 24),
              Expanded(
                child: WhiteSheet(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(28, 28, 28, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Créer un compte',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0D1B4B),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Rejoignez la plateforme FDCUIC',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.black.withValues(alpha: 0.45),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Nom + Prénom côte à côte
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const FDLabel('Nom'),
                                  const SizedBox(height: 6),
                                  FDTextField(
                                    controller: _nomController,
                                    hint: 'Diallo',
                                    icon: Icons.person_outline_rounded,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const FDLabel('Prénom'),
                                  const SizedBox(height: 6),
                                  FDTextField(
                                    controller: _prenomController,
                                    hint: 'Aminata',
                                    icon: Icons.person_outline_rounded,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Téléphone
                        const FDLabel('Téléphone'),
                        const SizedBox(height: 6),
                        FDTextField(
                          controller: _telController,
                          hint: '+221 77 000 00 00',
                          icon: Icons.phone_outlined,
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 16),

                        // Email
                        const FDLabel('Email'),
                        const SizedBox(height: 6),
                        FDTextField(
                          controller: _emailController,
                          hint: 'exemple@email.com',
                          icon: Icons.mail_outline_rounded,
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 16),

                        // Mot de passe
                        const FDLabel('Mot de passe'),
                        const SizedBox(height: 6),
                        FDPasswordField(
                          controller: _passwordController,
                          hint: 'Minimum 8 caractères',
                        ),
                        const SizedBox(height: 16),

                        // Confirmation
                        const FDLabel('Confirmer le mot de passe'),
                        const SizedBox(height: 6),
                        FDPasswordField(
                          controller: _confirmController,
                          hint: 'Répétez le mot de passe',
                        ),
                        const SizedBox(height: 32),

                        // Bouton S'inscrire
                        FDButton(
                          label: 'S\'inscrire',
                          isLoading: _isLoading,
                          onTap: _register,
                        ),
                        const SizedBox(height: 24),

                        // Lien connexion
                        FDAuthLink(
                          question: 'Déjà un compte ?',
                          linkText: 'Se connecter',
                          onTap: () => Navigator.pushReplacementNamed(context, '/login'),
                        ),
                        const SizedBox(height: 16),
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