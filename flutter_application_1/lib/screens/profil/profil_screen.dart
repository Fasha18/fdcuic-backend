import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../core/theme_provider.dart';
import '../../services/api_service.dart';
import '../../utils/form_validators.dart';
import 'package:file_picker/file_picker.dart';

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

  bool _isUploadingAvatar = false;

  Future<void> _pickAndUploadAvatar() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.image,
      );

      if (result != null && result.files.single.path != null) {
        setState(() => _isUploadingAvatar = true);
        final response = await ApiService.uploadAvatar(result.files.single.path!);
        if (response.containsKey('avatar_url')) {
          setState(() {
            _user!['avatar_url'] = response['avatar_url'];
          });
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Photo de profil mise à jour'), backgroundColor: AppColors.success),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploadingAvatar = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDark;
    final c = AppColors(isDark);

    if (_user == null) {
      return Scaffold(
        backgroundColor: c.bgPrimary,
        body: Center(child: CircularProgressIndicator(color: c.accentPurple)),
      );
    }

    final nom = _user!['nom'] as String? ?? '';
    final prenom = _user!['prenom'] as String? ?? '';
    final email = _user!['email'] as String? ?? '';
    final initial = nom.isNotEmpty ? nom.substring(0, 1).toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: c.bgPrimary,
      body: SafeArea(
        child: Column(
          children: [
            // Header compact
            Padding(
              padding: EdgeInsets.fromLTRB(24, 16, 24, 16),
              child: Row(
                children: [
                  if (Navigator.canPop(context)) ...[
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 40.w, height: 40.h,
                        decoration: BoxDecoration(
                          color: c.bgCard,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: c.borderMain),
                        ),
                        child: Icon(Icons.arrow_back_ios_new_rounded, size: 16, color: c.txtPrimary),
                      ),
                    ),
                    SizedBox(width: 16.w),
                  ],
                  Text("Mon Profil",
                    style: GoogleFonts.sora(fontSize: 18.sp, fontWeight: FontWeight.w700, color: c.txtPrimary)),
                ],
              ),
            ),

            // Contenu
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    // Avatar et Header Info
                    Container(
                      padding: EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: c.bgCard,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: c.borderMain),
                      ),
                      child: Row(
                        children: [
                          GestureDetector(
                            onTap: _pickAndUploadAvatar,
                            child: Stack(
                              children: [
                                Container(
                                  width: 64.w, height: 64.h,
                                  decoration: BoxDecoration(
                                    color: c.accentPurple,
                                    shape: BoxShape.circle,
                                    image: _user!['avatar_url'] != null
                                        ? DecorationImage(
                                            image: NetworkImage(_user!['avatar_url']),
                                            fit: BoxFit.cover,
                                          )
                                        : null,
                                  ),
                                  child: _user!['avatar_url'] == null
                                      ? Center(
                                          child: Text(initial,
                                            style: GoogleFonts.sora(fontSize: 24.sp, fontWeight: FontWeight.w700, color: Colors.white)),
                                        )
                                      : null,
                                ),
                                if (_isUploadingAvatar)
                                  Positioned.fill(
                                    child: Container(
                                      decoration: const BoxDecoration(
                                        color: Colors.black45,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Center(
                                        child: SizedBox(
                                          width: 24, height: 24,
                                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                        ),
                                      ),
                                    ),
                                  ),
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Container(
                                    padding: EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: c.bgPrimary,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: c.borderMain),
                                    ),
                                    child: Icon(Icons.camera_alt_rounded, size: 12, color: c.txtSecondary),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 16.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('$prenom $nom',
                                  style: GoogleFonts.sora(fontSize: 16.sp, fontWeight: FontWeight.w700, color: c.txtPrimary)),
                                SizedBox(height: 4.h),
                                Text(email,
                                  style: GoogleFonts.sora(fontSize: 12.sp, color: c.txtSecondary)),
                                SizedBox(height: 8.h),
                                Container(
                                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: c.bgAccent,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(_user!['role']?.toString().toUpperCase() ?? 'CANDIDAT',
                                    style: GoogleFonts.sora(fontSize: 10.sp, fontWeight: FontWeight.w700, color: c.accentText)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 24.h),

                    // Informations personnelles
                    _ProfilInfosForm(user: _user!, onUserUpdated: _onUserUpdated, c: c),
                    SizedBox(height: 24.h),

                    // Préférences
                    _ProfilPreferences(user: _user!, c: c, themeProvider: themeProvider),
                    SizedBox(height: 24.h),

                    // Sécurité
                    _ProfilPasswordForm(c: c),
                    SizedBox(height: 24.h),

                    // Infos Compte (Lecture seule)
                    _ProfilReadOnlyInfo(user: _user!, c: c),
                    SizedBox(height: 40.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfilInfosForm extends StatefulWidget {
  final Map<String, dynamic> user;
  final Function(Map<String, dynamic>) onUserUpdated;
  final AppColors c;

  const _ProfilInfosForm({required this.user, required this.onUserUpdated, required this.c});

  @override
  State<_ProfilInfosForm> createState() => _ProfilInfosFormState();
}

class _ProfilInfosFormState extends State<_ProfilInfosForm> {
  final _formKey = GlobalKey<FormState>();
  late String _nom;
  late String _prenom;
  late String _telephone;
  String? _typePiece;
  String? _numPiece;
  String? _dateNaissance;
  bool _isLoading = false;

  final TextEditingController _dateController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _nom = widget.user['nom'] ?? '';
    _prenom = widget.user['prenom'] ?? '';
    _telephone = widget.user['telephone'] ?? '';
    _typePiece = widget.user['type_piece_identite'];
    _numPiece = widget.user['numero_piece_identite'];
    _dateNaissance = widget.user['date_naissance'];

    if (_dateNaissance != null && _dateNaissance!.isNotEmpty) {
      try {
        final d = DateTime.parse(_dateNaissance!);
        final day = d.day.toString().padLeft(2, '0');
        final month = d.month.toString().padLeft(2, '0');
        _dateController.text = '$day/$month/${d.year}';
      } catch (_) {
        _dateController.text = _dateNaissance!;
      }
    }
  }

  Future<void> _selectDate() async {
    DateTime initial = DateTime.now().subtract(const Duration(days: 365 * 18));
    if (_dateNaissance != null && _dateNaissance!.isNotEmpty) {
      try { initial = DateTime.parse(_dateNaissance!); } catch (_) {}
    }
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: widget.c.accentPurple,
              onPrimary: Colors.white,
              surface: widget.c.bgCard,
              onSurface: widget.c.txtPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        final day = picked.day.toString().padLeft(2, '0');
        final month = picked.month.toString().padLeft(2, '0');
        _dateNaissance = '${picked.year}-$month-$day';
        _dateController.text = '$day/$month/${picked.year}';
      });
    }
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
        'type_piece_identite': _typePiece,
        'numero_piece_identite': _numPiece,
        'date_naissance': _dateNaissance,
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
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Widget _buildLabel(String text) {
    return Text(text, style: GoogleFonts.sora(fontSize: 12.sp, fontWeight: FontWeight.w600, color: widget.c.txtPrimary));
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      filled: true,
      fillColor: widget.c.bgPrimary,
      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: widget.c.borderMain, width: 1)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: widget.c.borderMain, width: 1)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: widget.c.accentPurple, width: 1.5)),
      hintStyle: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtSecondary.withValues(alpha: 0.5)),
      hintText: label,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: widget.c.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: widget.c.borderMain),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.person_outline_rounded, color: widget.c.accentPurple, size: 20),
                SizedBox(width: 8.w),
                Text('Informations personnelles',
                  style: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600, color: widget.c.txtPrimary)),
              ],
            ),
            SizedBox(height: 20.h),
            
            // Ligne 1: Prénom / Nom
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Prénom'),
                      SizedBox(height: 6.h),
                      TextFormField(
                        initialValue: _prenom,
                        style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
                        decoration: _inputDecoration('Prénom'),
                        validator: FormValidators.requiredField,
                        onSaved: (val) => _prenom = val!,
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Nom'),
                      SizedBox(height: 6.h),
                      TextFormField(
                        initialValue: _nom,
                        style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
                        decoration: _inputDecoration('Nom'),
                        validator: FormValidators.requiredField,
                        onSaved: (val) => _nom = val!,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 16.h),

            // Ligne 2: Téléphone / Date naissance
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Téléphone'),
                      SizedBox(height: 6.h),
                      TextFormField(
                        initialValue: _telephone,
                        style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
                        decoration: _inputDecoration('Téléphone'),
                        keyboardType: TextInputType.phone,
                        validator: FormValidators.phone,
                        onSaved: (val) => _telephone = val!,
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Date de naissance'),
                      SizedBox(height: 6.h),
                      TextFormField(
                        controller: _dateController,
                        readOnly: true,
                        onTap: _selectDate,
                        style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
                        decoration: _inputDecoration('JJ/MM/AAAA').copyWith(
                          suffixIcon: Icon(Icons.calendar_today_outlined, size: 16, color: widget.c.txtSecondary),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 16.h),

            // Ligne 3: Type pièce / Numéro pièce
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Type de pièce'),
                      SizedBox(height: 6.h),
                      DropdownButtonFormField<String>(
                        isExpanded: true,
                        iconSize: 20,
                        value: _typePiece != null && ['CNI', 'Passeport'].contains(_typePiece) ? _typePiece : null,
                        items: const [
                          DropdownMenuItem(value: 'CNI', child: Text('CNI', overflow: TextOverflow.ellipsis)),
                          DropdownMenuItem(value: 'Passeport', child: Text('Passeport', overflow: TextOverflow.ellipsis)),
                        ],
                        onChanged: (val) => setState(() => _typePiece = val),
                        style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
                        decoration: _inputDecoration('Choisir'),
                        dropdownColor: widget.c.bgCard,
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('N° de pièce'),
                      SizedBox(height: 6.h),
                      TextFormField(
                        initialValue: _numPiece,
                        style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
                        decoration: _inputDecoration('Numéro'),
                        onSaved: (val) => _numPiece = val,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 24.h),
            
            _isLoading
                ? Center(child: CircularProgressIndicator(color: widget.c.accentPurple))
                : ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: widget.c.accentPurple,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      minimumSize: const Size(double.infinity, 48),
                    ),
                    child: Text('Mettre à jour', style: GoogleFonts.sora(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                  ),
          ],
        ),
      ),
    );
  }
}

class _ProfilPreferences extends StatefulWidget {
  final Map<String, dynamic> user;
  final ThemeProvider themeProvider;
  final AppColors c;

  const _ProfilPreferences({required this.user, required this.themeProvider, required this.c});

  @override
  State<_ProfilPreferences> createState() => _ProfilPreferencesState();
}

class _ProfilPreferencesState extends State<_ProfilPreferences> {
  bool _isLoadingNotifs = false;

  Future<void> _toggleNotifications(bool val) async {
    setState(() => _isLoadingNotifs = true);
    try {
      final res = await ApiService.updatePreferences(val);
      if (mounted) {
        setState(() {
          widget.user['notifications_email'] = res['notifications_email'];
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Préférences mises à jour'), backgroundColor: AppColors.success),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error));
      }
    } finally {
      if (mounted) setState(() => _isLoadingNotifs = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: widget.c.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: widget.c.borderMain),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.tune_rounded, color: widget.c.accentPurple, size: 20),
              SizedBox(width: 8.w),
              Text('Préférences', style: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600, color: widget.c.txtPrimary)),
            ],
          ),
          SizedBox(height: 16.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Mode Sombre', style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary)),
              Switch(
                value: widget.themeProvider.isDark,
                onChanged: (_) => widget.themeProvider.toggle(),
                activeColor: widget.c.accentPurple,
              ),
            ],
          ),
          Divider(color: widget.c.borderMain, height: 24.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Notifications Push', style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary)),
              _isLoadingNotifs 
                  ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: widget.c.accentPurple, strokeWidth: 2))
                  : Switch(
                      value: widget.user['notifications_email'] ?? true,
                      onChanged: _toggleNotifications,
                      activeColor: widget.c.accentPurple,
                    ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProfilPasswordForm extends StatefulWidget {
  final AppColors c;
  const _ProfilPasswordForm({required this.c});

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
        'ancienMotDePasse': _actuel,
        'nouveauMotDePasse': _nouveau,
        'confirmationNouveauMotDePasse': _confirmation,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mot de passe mis à jour'), backgroundColor: AppColors.success),
        );
        _formKey.currentState!.reset();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      filled: true,
      fillColor: widget.c.bgPrimary,
      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: widget.c.borderMain)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: widget.c.borderMain)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: widget.c.accentPurple)),
      hintText: label,
      hintStyle: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtSecondary.withValues(alpha: 0.5)),
      suffixIcon: IconButton(
        icon: Icon(_obscureText ? Icons.visibility_off : Icons.visibility, color: widget.c.txtSecondary, size: 20),
        onPressed: () => setState(() => _obscureText = !_obscureText),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: widget.c.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: widget.c.borderMain),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.lock_outline_rounded, color: widget.c.accentPurple, size: 20),
                SizedBox(width: 8.w),
                Text('Sécurité', style: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600, color: widget.c.txtPrimary)),
              ],
            ),
            SizedBox(height: 20.h),
            
            TextFormField(
              obscureText: _obscureText,
              style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
              decoration: _inputDecoration('Mot de passe actuel'),
              validator: FormValidators.requiredField,
              onSaved: (val) => _actuel = val!,
            ),
            SizedBox(height: 12.h),
            
            TextFormField(
              obscureText: _obscureText,
              style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
              decoration: _inputDecoration('Nouveau mot de passe'),
              validator: (v) => (v == null || v.isEmpty) ? 'Requis' : (v.length < 8 ? 'Min. 8 caractères' : null),
              onChanged: (val) => _nouveau = val,
              onSaved: (val) => _nouveau = val!,
            ),
            SizedBox(height: 12.h),
            
            TextFormField(
              obscureText: _obscureText,
              style: GoogleFonts.sora(fontSize: 13.sp, color: widget.c.txtPrimary),
              decoration: _inputDecoration('Confirmer mot de passe'),
              validator: (v) => (v == null || v.isEmpty) ? 'Requis' : (v != _nouveau ? 'Ne correspond pas' : null),
              onSaved: (val) => _confirmation = val!,
            ),
            SizedBox(height: 20.h),
            
            _isLoading
                ? Center(child: CircularProgressIndicator(color: widget.c.accentPurple))
                : ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: widget.c.bgPrimary,
                      foregroundColor: widget.c.accentPurple,
                      side: BorderSide(color: widget.c.accentPurple),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      minimumSize: const Size(double.infinity, 48),
                    ),
                    child: Text('Changer de mot de passe', style: GoogleFonts.sora(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                  ),
          ],
        ),
      ),
    );
  }
}

class _ProfilReadOnlyInfo extends StatelessWidget {
  final Map<String, dynamic> user;
  final AppColors c;

  const _ProfilReadOnlyInfo({required this.user, required this.c});

  @override
  Widget build(BuildContext context) {
    String joinedDate = 'N/A';
    if (user['createdAt'] != null) {
      try {
        final d = DateTime.parse(user['createdAt']);
        final day = d.day.toString().padLeft(2, '0');
        final month = d.month.toString().padLeft(2, '0');
        joinedDate = '$day/$month/${d.year}';
      } catch (_) {}
    }

    String lastConnexion = 'N/A';
    if (user['derniere_connexion'] != null) {
      try {
        final d = DateTime.parse(user['derniere_connexion']);
        final day = d.day.toString().padLeft(2, '0');
        final month = d.month.toString().padLeft(2, '0');
        final hour = d.hour.toString().padLeft(2, '0');
        final minute = d.minute.toString().padLeft(2, '0');
        lastConnexion = '$day/$month/${d.year} à $hour:$minute';
      } catch (_) {}
    }

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: c.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: c.borderMain),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline_rounded, color: c.accentPurple, size: 20),
              SizedBox(width: 8.w),
              Text('Informations du compte', style: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600, color: c.txtPrimary)),
            ],
          ),
          SizedBox(height: 16.h),
          _InfoRow(label: "Rôle", value: user['role']?.toString().toUpperCase() ?? 'CANDIDAT', c: c),
          Divider(color: c.borderMain, height: 24.h),
          _InfoRow(label: "Membre depuis le", value: joinedDate, c: c),
          Divider(color: c.borderMain, height: 24.h),
          _InfoRow(label: "Dernière connexion", value: lastConnexion, c: c),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final AppColors c;

  const _InfoRow({required this.label, required this.value, required this.c});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.sora(fontSize: 13.sp, color: c.txtSecondary)),
        Text(value, style: GoogleFonts.sora(fontSize: 13.sp, fontWeight: FontWeight.w600, color: c.txtPrimary)),
      ],
    );
  }
}
