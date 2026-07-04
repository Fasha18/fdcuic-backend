import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';
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
        backgroundColor: AppColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_user == null) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final nom = _user!['nom'] as String? ?? '';
    final prenom = _user!['prenom'] as String? ?? '';
    final email = _user!['email'] as String? ?? '';
    final role = _user!['role'] as String? ?? 'CANDIDAT';
    final initial = nom.isNotEmpty ? nom.substring(0, 1).toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
      body: Column(
        children: [
          // HEADER PROFIL
          Container(
            color: isDark ? AppColors.darkBgHeader : AppColors.lightBgHeader,
            padding: EdgeInsets.fromLTRB(24, 0, 24, 20),
            child: SafeArea(
              bottom: false,
              child: Column(
                children: [
                  // Barre navigation retour
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Icon(Icons.arrow_back_ios_new_rounded, size: 18,
                          color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                      ),
                      GestureDetector(
                        onTap: _logout,
                        child: Icon(Icons.logout_rounded, size: 20,
                          color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                      ),
                    ],
                  ),
                  SizedBox(height: 20.h),

                  // Avatar avec initiale
                  Container(
                    width: 72.w, height: 72.h,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkAccent : AppColors.lightAccent,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isDark ? AppColors.darkBorderAccent : AppColors.lightBorderAccent,
                        width: 2,
                      ),
                    ),
                    child: Center(
                      child: Text(initial,
                        style: GoogleFonts.sora(fontSize: 28.sp, fontWeight: FontWeight.w700,
                          color: Colors.white)),
                    ),
                  ),
                  SizedBox(height: 12.h),

                  // Nom
                  Text('$prenom $nom',
                    style: GoogleFonts.sora(fontSize: 18.sp, fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
                  SizedBox(height: 4.h),

                  // Email
                  Text(email,
                    style: GoogleFonts.sora(fontSize: 13.sp,
                      color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary)),
                  SizedBox(height: 12.h),

                  // Badge CANDIDAT
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isDark ? AppColors.darkBorderAccent : AppColors.lightBorderAccent,
                        width: 1,
                      ),
                    ),
                    child: Text(role.toUpperCase(),
                      style: GoogleFonts.sora(fontSize: 11.sp, fontWeight: FontWeight.w700,
                        letterSpacing: 0.08,
                        color: isDark ? AppColors.darkAccent : AppColors.lightAccent)),
                  ),
                ],
              ),
            ),
          ),

          // CORPS — formulaires
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(20),
              child: Column(
                children: [
                  _ProfilInfosForm(user: _user!, onUserUpdated: _onUserUpdated, isDark: isDark),
                  SizedBox(height: 20.h),
                  _ProfilPasswordForm(isDark: isDark),
                  SizedBox(height: 40.h),
                ],
              ),
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
  final bool isDark;

  const _ProfilInfosForm({required this.user, required this.onUserUpdated, required this.isDark});

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
          backgroundColor: AppColors.error,
        ));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildLabel(String text) {
    return Text(text, style: GoogleFonts.sora(fontSize: 12.sp, fontWeight: FontWeight.w600,
      color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary));
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      filled: true,
      fillColor: widget.isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: widget.isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: widget.isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: widget.isDark ? AppColors.darkAccent : AppColors.lightAccent,
          width: 1.5,
        ),
      ),
      labelStyle: GoogleFonts.sora(
        fontSize: 12.sp,
        color: widget.isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: widget.isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: widget.isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Informations personnelles',
              style: GoogleFonts.sora(fontSize: 16.sp, fontWeight: FontWeight.w600,
                color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
            SizedBox(height: 20.h),
            
            _buildLabel('Prénom'),
            SizedBox(height: 8.h),
            TextFormField(
              initialValue: _prenom,
              style: GoogleFonts.sora(fontSize: 14.sp, color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
              decoration: _inputDecoration('Prénom'),
              validator: FormValidators.requiredField,
              onSaved: (val) => _prenom = val!,
            ),
            SizedBox(height: 16.h),
            
            _buildLabel('Nom'),
            SizedBox(height: 8.h),
            TextFormField(
              initialValue: _nom,
              style: GoogleFonts.sora(fontSize: 14.sp, color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
              decoration: _inputDecoration('Nom'),
              validator: FormValidators.requiredField,
              onSaved: (val) => _nom = val!,
            ),
            SizedBox(height: 16.h),
            
            _buildLabel('Téléphone'),
            SizedBox(height: 8.h),
            TextFormField(
              initialValue: _telephone,
              style: GoogleFonts.sora(fontSize: 14.sp, color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
              decoration: _inputDecoration('Téléphone'),
              keyboardType: TextInputType.phone,
              validator: FormValidators.phone,
              onSaved: (val) => _telephone = val!,
            ),
            SizedBox(height: 24.h),
            
            _isLoading
                ? Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: widget.isDark ? AppColors.darkAccent : AppColors.lightAccent,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      minimumSize: const Size(double.infinity, 52),
                      textStyle: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600),
                    ),
                    child: Text('Mettre à jour le profil'),
                  ),
          ],
        ),
      ),
    );
  }
}

class _ProfilPasswordForm extends StatefulWidget {
  final bool isDark;
  const _ProfilPasswordForm({required this.isDark});

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
            backgroundColor: AppColors.success,
          ),
        );
        _formKey.currentState!.reset();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()),
          backgroundColor: AppColors.error,
        ));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildLabel(String text) {
    return Text(text, style: GoogleFonts.sora(fontSize: 12.sp, fontWeight: FontWeight.w600,
      color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary));
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      filled: true,
      fillColor: widget.isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: widget.isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: widget.isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: widget.isDark ? AppColors.darkAccent : AppColors.lightAccent,
          width: 1.5,
        ),
      ),
      labelStyle: GoogleFonts.sora(
        fontSize: 12.sp,
        color: widget.isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
      ),
      suffixIcon: IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility_off : Icons.visibility,
          color: widget.isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
        ),
        onPressed: () {
          setState(() {
            _obscureText = !_obscureText;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: widget.isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: widget.isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Sécurité', style: GoogleFonts.sora(fontSize: 16.sp, fontWeight: FontWeight.w600,
              color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
            SizedBox(height: 20.h),
            
            _buildLabel('Mot de passe actuel'),
            SizedBox(height: 8.h),
            TextFormField(
              obscureText: _obscureText,
              style: GoogleFonts.sora(fontSize: 14.sp, color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
              decoration: _inputDecoration('Mot de passe actuel'),
              validator: FormValidators.requiredField,
              onSaved: (val) => _actuel = val!,
            ),
            SizedBox(height: 16.h),
            
            _buildLabel('Nouveau mot de passe'),
            SizedBox(height: 8.h),
            TextFormField(
              obscureText: _obscureText,
              style: GoogleFonts.sora(fontSize: 14.sp, color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
              decoration: _inputDecoration('Nouveau mot de passe'),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Requis';
                if (v.length < 8) return 'Min. 8 caractères';
                return null;
              },
              onChanged: (val) => _nouveau = val,
              onSaved: (val) => _nouveau = val!,
            ),
            SizedBox(height: 16.h),
            
            _buildLabel('Confirmer mot de passe'),
            SizedBox(height: 8.h),
            TextFormField(
              obscureText: _obscureText,
              style: GoogleFonts.sora(fontSize: 14.sp, color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
              decoration: _inputDecoration('Confirmer mot de passe'),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Requis';
                if (v != _nouveau) return 'Les mots de passe ne correspondent pas';
                return null;
              },
              onSaved: (val) => _confirmation = val!,
            ),
            SizedBox(height: 24.h),
            
            _isLoading
                ? Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: widget.isDark ? AppColors.darkAccent : AppColors.lightAccent,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      minimumSize: const Size(double.infinity, 52),
                      textStyle: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600),
                    ),
                    child: Text('Changer le mot de passe'),
                  ),
          ],
        ),
      ),
    );
  }
}
