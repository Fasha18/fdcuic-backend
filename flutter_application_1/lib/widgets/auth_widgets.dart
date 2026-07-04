import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../core/theme.dart';

// ── FOND DÉGRADÉ AUTH ─────────────────────────────────────
class GradientBackground extends StatelessWidget {
  final Widget child;
  const GradientBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            FDColors.navy,       // 0xFF0A1F4E — ton navy existant
            FDColors.royal,      // 0xFF1E5FD8
            FDColors.royalLight, // 0xFF3D7BEF
            FDColors.white,      // blanc en bas
          ],
          stops: [0.0, 0.25, 0.5, 0.78],
        ),
      ),
      child: child,
    );
  }
}

// ── LOGO FDCUIC ───────────────────────────────────────────
class FDLogo extends StatelessWidget {
  final double size;
  const FDLogo({super.key, this.size = 72});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Image.asset(
          'assets/images/FDCUIC_logo.png',
          height: size * 0.8,
        ),
      ],
    );
  }
}

// ── FEUILLE BLANCHE ARRONDIE ──────────────────────────────
class WhiteSheet extends StatelessWidget {
  final Widget child;
  const WhiteSheet({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: FDColors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(32),
          topRight: Radius.circular(32),
        ),
        boxShadow: FDShadow.ice, // ton ombre glacée
      ),
      child: child,
    );
  }
}

// ── LABEL CHAMP ───────────────────────────────────────────
class FDLabel extends StatelessWidget {
  final String text;
  const FDLabel(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Text(text, style: FDText.label.copyWith(
      color: FDColors.textPrimary,
      fontSize: 13.sp,
      fontWeight: FontWeight.w600,
    ));
  }
}

// ── CHAMP TEXTE ───────────────────────────────────────────
class FDTextField extends StatelessWidget {
  final String hint;
  final IconData icon;
  final TextInputType keyboardType;
  final TextEditingController? controller;
  final String? Function(String?)? validator;

  FDTextField({
    super.key,
    required this.hint,
    required this.icon,
    this.keyboardType = TextInputType.text,
    this.controller,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      style: FDText.body.copyWith(color: FDColors.textPrimary),
      validator: validator,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, size: 18, color: FDColors.textHint),
        errorMaxLines: 2,
      ),
    );
  }
}

// ── CHAMP MOT DE PASSE ────────────────────────────────────
class FDPasswordField extends StatefulWidget {
  final String hint;
  final TextEditingController? controller;
  final String? Function(String?)? validator;

  const FDPasswordField({
    super.key,
    this.hint = '••••••••',
    this.controller,
    this.validator,
  });

  @override
  State<FDPasswordField> createState() => _FDPasswordFieldState();
}

class _FDPasswordFieldState extends State<FDPasswordField> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: widget.controller,
      obscureText: _obscure,
      style: FDText.body.copyWith(color: FDColors.textPrimary),
      validator: widget.validator,
      decoration: InputDecoration(
        hintText: widget.hint,
        prefixIcon: Icon(
          Icons.lock_outline_rounded,
          size: 18,
          color: FDColors.textHint,
        ),
        suffixIcon: IconButton(
          icon: Icon(
            _obscure
                ? Icons.visibility_off_outlined
                : Icons.visibility_outlined,
            size: 18,
            color: FDColors.textHint,
          ),
          onPressed: () => setState(() => _obscure = !_obscure),
        ),
        errorMaxLines: 2,
      ),
    );
  }
}

// ── BOUTON PRINCIPAL (avec dégradé ctaButton) ─────────────
class FDButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool isLoading;
  const FDButton({
    super.key,
    required this.label,
    required this.onTap,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54.h,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: FDGradients.ctaButton, // ton gradient existant
          borderRadius: FDRadius.button,
          boxShadow: FDShadow.ctaButton,
        ),
        child: ElevatedButton(
          onPressed: isLoading ? null : onTap,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            disabledBackgroundColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: FDRadius.button,
            ),
          ),
          child: isLoading
              ? SizedBox(
                  width: 24.w,
                  height: 24.h,
                  child: CircularProgressIndicator(
                    color: FDColors.white,
                    strokeWidth: 2.5,
                  ),
                )
              : Text(label, style: FDText.button.copyWith(
                  color: FDColors.white,
                  fontSize: 15.sp,
                )),
        ),
      ),
    );
  }
}

// ── BOUTON OUTLINE ────────────────────────────────────────
class FDOutlineButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const FDOutlineButton({super.key, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54.h,
      child: OutlinedButton(
        onPressed: onTap,
        // style vient du outlinedButtonTheme global
        child: Text(label, style: FDText.button.copyWith(fontSize: 15.sp)),
      ),
    );
  }
}

// ── LIEN NAVIGATION AUTH ──────────────────────────────────
class FDAuthLink extends StatelessWidget {
  final String question;
  final String linkText;
  final VoidCallback onTap;
  const FDAuthLink({
    super.key,
    required this.question,
    required this.linkText,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: GestureDetector(
        onTap: onTap,
        child: RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: question,
                style: FDText.body.copyWith(color: FDColors.textSub),
              ),
              TextSpan(
                text: ' $linkText',
                style: FDText.body.copyWith(
                  color: FDColors.royal,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}