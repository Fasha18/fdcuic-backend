import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';
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
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

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
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pushReplacementNamed(context, '/login');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppColors.error,
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

  Widget _buildLabel(String text, bool isDark) {
    return Text(text, style: GoogleFonts.sora(fontSize: 12.sp, fontWeight: FontWeight.w600,
      color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary));
  }

  InputDecoration _inputDecoration(bool isDark) {
    return InputDecoration(
      filled: true,
      fillColor: isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: isDark ? AppColors.darkAccent : AppColors.lightAccent,
          width: 1.5,
        ),
      ),
      labelStyle: GoogleFonts.sora(
        fontSize: 12.sp,
        color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(24),
          child: Column(
            children: [
              SizedBox(height: 24.h),

              // Logo FDCUIC
              Image.asset(
                'assets/images/FDCUIC_logo.png',
                height: 48.h,
              ),
              SizedBox(height: 8.h),
              Text('ESPACE CANDIDAT',
                style: GoogleFonts.sora(
                  fontSize: 10.sp, fontWeight: FontWeight.w600,
                  letterSpacing: 0.12,
                  color: isDark ? AppColors.darkAccent : AppColors.lightAccent,
                )),

              SizedBox(height: 32.h),

              // Carte formulaire
              Container(
                padding: EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Créer un compte',
                      style: GoogleFonts.sora(
                        fontSize: 20.sp, fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary,
                      )),
                    SizedBox(height: 4.h),
                    Text('Rejoignez la plateforme FDCUIC',
                      style: GoogleFonts.sora(
                        fontSize: 13.sp,
                        color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
                      )),
                    SizedBox(height: 24.h),

                    // Nom + Prénom
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Nom', isDark),
                              SizedBox(height: 8.h),
                              TextField(
                                controller: _nomController,
                                style: GoogleFonts.sora(fontSize: 14.sp, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
                                decoration: _inputDecoration(isDark),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Prénom', isDark),
                              SizedBox(height: 8.h),
                              TextField(
                                controller: _prenomController,
                                style: GoogleFonts.sora(fontSize: 14.sp, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
                                decoration: _inputDecoration(isDark),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16.h),

                    // Téléphone
                    _buildLabel('Téléphone', isDark),
                    SizedBox(height: 8.h),
                    TextField(
                      controller: _telController,
                      keyboardType: TextInputType.phone,
                      style: GoogleFonts.sora(fontSize: 14.sp, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
                      decoration: _inputDecoration(isDark),
                    ),
                    SizedBox(height: 16.h),

                    // Email
                    _buildLabel('Email', isDark),
                    SizedBox(height: 8.h),
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: GoogleFonts.sora(fontSize: 14.sp, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
                      decoration: _inputDecoration(isDark),
                    ),
                    SizedBox(height: 16.h),

                    // Mot de passe
                    _buildLabel('Mot de passe', isDark),
                    SizedBox(height: 8.h),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      style: GoogleFonts.sora(fontSize: 14.sp, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
                      decoration: _inputDecoration(isDark).copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off : Icons.visibility,
                            color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                      ),
                    ),
                    SizedBox(height: 16.h),

                    // Confirmation mot de passe
                    _buildLabel('Confirmer le mot de passe', isDark),
                    SizedBox(height: 8.h),
                    TextField(
                      controller: _confirmController,
                      obscureText: _obscureConfirm,
                      style: GoogleFonts.sora(fontSize: 14.sp, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
                      decoration: _inputDecoration(isDark).copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirm ? Icons.visibility_off : Icons.visibility,
                            color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscureConfirm = !_obscureConfirm;
                            });
                          },
                        ),
                      ),
                    ),
                    SizedBox(height: 24.h),

                    // Bouton inscription
                    ElevatedButton(
                      onPressed: _isLoading ? null : _register,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? AppColors.darkAccent : AppColors.lightAccent,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        minimumSize: const Size(double.infinity, 52),
                        textStyle: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600),
                      ),
                      child: _isLoading 
                        ? SizedBox(height: 20.h, width: 20.w, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text('S\'inscrire'),
                    ),

                    SizedBox(height: 16.h),

                    // Lien connexion
                    Center(
                      child: GestureDetector(
                        onTap: () => Navigator.pushReplacementNamed(context, '/login'),
                        child: RichText(text: TextSpan(children: [
                          TextSpan(text: "Déjà un compte ? ",
                            style: GoogleFonts.sora(fontSize: 13.sp,
                              color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary)),
                          TextSpan(text: "Se connecter",
                            style: GoogleFonts.sora(fontSize: 13.sp, fontWeight: FontWeight.w600,
                              color: isDark ? AppColors.darkAccent : AppColors.lightAccent)),
                        ])),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}