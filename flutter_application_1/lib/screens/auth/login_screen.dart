import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';
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
  bool _obscurePassword = true;

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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(24),
          child: Column(
            children: [
              SizedBox(height: 48.h),

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

              SizedBox(height: 40.h),

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
                    Text('Connexion',
                      style: GoogleFonts.sora(
                        fontSize: 20.sp, fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary,
                      )),
                    SizedBox(height: 4.h),
                    Text('Accédez à votre espace candidat',
                      style: GoogleFonts.sora(
                        fontSize: 13.sp,
                        color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
                      )),
                    SizedBox(height: 24.h),

                    // Champ Email (utilise Règle 4)
                    Text('Email', style: GoogleFonts.sora(fontSize: 12.sp, fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
                    SizedBox(height: 8.h),
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: GoogleFonts.sora(
                        fontSize: 14.sp,
                        color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary,
                      ),
                      decoration: InputDecoration(
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
                      ),
                    ),

                    SizedBox(height: 16.h),

                    // Champ Mot de passe (utilise Règle 4)
                    Text('Mot de passe', style: GoogleFonts.sora(fontSize: 12.sp, fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
                    SizedBox(height: 8.h),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      style: GoogleFonts.sora(
                        fontSize: 14.sp,
                        color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary,
                      ),
                      decoration: InputDecoration(
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

                    SizedBox(height: 24.h),

                    // Bouton connexion (utilise Règle 3)
                    ElevatedButton(
                      onPressed: _isLoading ? null : _login,
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
                        : Text('Se connecter'),
                    ),

                    SizedBox(height: 16.h),

                    // Lien inscription
                    Center(
                      child: GestureDetector(
                        onTap: () => Navigator.pushNamed(context, '/register'),
                        child: RichText(text: TextSpan(children: [
                          TextSpan(text: "Pas encore de compte ? ",
                            style: GoogleFonts.sora(fontSize: 13.sp,
                              color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary)),
                          TextSpan(text: "S'inscrire",
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