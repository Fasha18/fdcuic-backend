import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';
import '../../widgets/auth_widgets.dart';
import '../../services/api_service.dart';
import '../../utils/form_validators.dart';

class ProfilScreen extends StatefulWidget {
  const ProfilScreen({super.key});

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr != null) {
      setState(() {
        _user = jsonDecode(userStr);
      });
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  void _onUserUpdated(Map<String, dynamic> updatedUser) {
    setState(() {
      _user = updatedUser;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Profil mis à jour avec succès'),
        backgroundColor: FDColors.mint,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
      return const Scaffold(
        backgroundColor: FDColors.skyBg,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: FDColors.skyBg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 260.0,
            floating: false,
            pinned: true,
            backgroundColor: FDColors.navy,
            elevation: 0,
            actions: [
              IconButton(
                icon: const Icon(Icons.logout_rounded, color: FDColors.white),
                tooltip: 'Se déconnecter',
                onPressed: _logout,
              ),
              const SizedBox(width: 8),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                width: double.infinity,
                padding: const EdgeInsets.only(top: 80, bottom: 20),
                decoration: const BoxDecoration(
                  gradient: FDGradients.header,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        color: FDColors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: FDColors.navy.withValues(alpha: 0.2),
                            blurRadius: 15,
                            offset: const Offset(0, 5),
                          )
                        ],
                      ),
                      child: Center(
                        child: Text(
                          _user!['nom']?.substring(0, 1).toUpperCase() ?? 'U',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w800,
                            color: FDColors.royal,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '${_user!['prenom']} ${_user!['nom']}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: FDColors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _user!['email'],
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: FDColors.white.withValues(alpha: 0.9),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: FDColors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(FDRadius.pill),
                        border: Border.all(color: FDColors.white.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        _user!['role']?.toUpperCase() ?? 'CANDIDAT',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: FDColors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 30, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _ProfilInfosForm(user: _user!, onUserUpdated: _onUserUpdated),
                const SizedBox(height: 30),
                const _ProfilPasswordForm(),
                const SizedBox(height: 40),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfilInfosForm extends StatefulWidget {
  final Map<String, dynamic> user;
  final Function(Map<String, dynamic>) onUserUpdated;

  const _ProfilInfosForm({required this.user, required this.onUserUpdated});

  @override
  State<_ProfilInfosForm> createState() => _ProfilInfosFormState();
}

class _ProfilInfosFormState extends State<_ProfilInfosForm> {
  final _formKey = GlobalKey<FormState>();
  late String _nom;
  late String _prenom;
  late String _telephone;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nom = widget.user['nom'] ?? '';
    _prenom = widget.user['prenom'] ?? '';
    _telephone = widget.user['telephone'] ?? '';
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isLoading = true);
    try {
      final res = await ApiService.updateProfil({
        'nom': _nom,
        'prenom': _prenom,
        'telephone': _telephone,
      });
      if (res['user'] != null) {
        widget.onUserUpdated(res['user']);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()),
          backgroundColor: FDColors.coral,
        ));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: FDColors.white,
        borderRadius: BorderRadius.circular(FDRadius.md),
        boxShadow: FDShadow.card,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Informations personnelles', style: FDText.h3),
            const SizedBox(height: 20),
            TextFormField(
              initialValue: _prenom,
              decoration: _inputDecoration('Prénom', Icons.person_outline),
              validator: FormValidators.requiredField,
              onSaved: (val) => _prenom = val!,
            ),
            const SizedBox(height: 16),
            TextFormField(
              initialValue: _nom,
              decoration: _inputDecoration('Nom', Icons.person_outline),
              validator: FormValidators.requiredField,
              onSaved: (val) => _nom = val!,
            ),
            const SizedBox(height: 16),
            TextFormField(
              initialValue: _telephone,
              decoration: _inputDecoration('Téléphone', Icons.phone_outlined),
              keyboardType: TextInputType.phone,
              validator: FormValidators.phone,
              onSaved: (val) => _telephone = val!,
            ),
            const SizedBox(height: 24),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: FDColors.royal,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(FDRadius.sm),
                        ),
                      ),
                      onPressed: _submit,
                      child: const Text(
                        'Mettre à jour le profil',
                        style: TextStyle(
                            color: FDColors.white, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: FDColors.royal),
      filled: true,
      fillColor: FDColors.ice,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(FDRadius.sm),
        borderSide: BorderSide.none,
      ),
    );
  }
}

class _ProfilPasswordForm extends StatefulWidget {
  const _ProfilPasswordForm();

  @override
  State<_ProfilPasswordForm> createState() => _ProfilPasswordFormState();
}

class _ProfilPasswordFormState extends State<_ProfilPasswordForm> {
  final _formKey = GlobalKey<FormState>();
  String _actuel = '';
  String _nouveau = '';
  String _confirmation = '';
  bool _isLoading = false;
  bool _obscureText = true;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isLoading = true);
    try {
      await ApiService.updatePassword({
        'mot_de_passe_actuel': _actuel,
        'nouveau_mot_de_passe': _nouveau,
        'confirmation_mot_de_passe': _confirmation,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Mot de passe mis à jour avec succès'),
            backgroundColor: FDColors.mint,
          ),
        );
        _formKey.currentState!.reset();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()),
          backgroundColor: FDColors.coral,
        ));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: FDColors.white,
        borderRadius: BorderRadius.circular(FDRadius.md),
        boxShadow: FDShadow.card,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Sécurité', style: FDText.h3),
            const SizedBox(height: 20),
            TextFormField(
              obscureText: _obscureText,
              decoration: _inputDecoration('Mot de passe actuel'),
              validator: FormValidators.requiredField,
              onSaved: (val) => _actuel = val!,
            ),
            const SizedBox(height: 16),
            TextFormField(
              obscureText: _obscureText,
              decoration: _inputDecoration('Nouveau mot de passe'),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Requis';
                if (v.length < 8) return 'Min. 8 caractères';
                return null;
              },
              onChanged: (val) => _nouveau = val,
              onSaved: (val) => _nouveau = val!,
            ),
            const SizedBox(height: 16),
            TextFormField(
              obscureText: _obscureText,
              decoration: _inputDecoration('Confirmer mot de passe'),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Requis';
                if (v != _nouveau) return 'Les mots de passe ne correspondent pas';
                return null;
              },
              onSaved: (val) => _confirmation = val!,
            ),
            const SizedBox(height: 24),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: FDColors.royal,
                        side: const BorderSide(color: FDColors.royal, width: 1.5),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(FDRadius.sm),
                        ),
                      ),
                      onPressed: _submit,
                      child: const Text('Changer le mot de passe'),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      prefixIcon: const Icon(Icons.lock_outline, color: FDColors.royal),
      suffixIcon: IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility_off : Icons.visibility,
          color: FDColors.textSub,
        ),
        onPressed: () {
          setState(() {
            _obscureText = !_obscureText;
          });
        },
      ),
      filled: true,
      fillColor: FDColors.ice,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(FDRadius.sm),
        borderSide: BorderSide.none,
      ),
    );
  }
}
