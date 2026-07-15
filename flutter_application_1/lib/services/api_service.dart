import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
class ApiService {
  // L'adresse IP est redirigée directement via ADB (adb reverse)
  static const String baseUrl = 'https://fdcuic-backend.onrender.com';
  // static const String baseUrl = 'http://192.168.1.71:3000'; // IP local pour tester avec un téléphone physique

  // ── TOKEN ─────────────────────────────────────────────
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<Map<String, String>> _headers({bool auth = true}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await getToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // ── AUTHENTIFICATION ──────────────────────────────────
  static Future<Map<String, dynamic>> login(String email, String motDePasse) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/connexion'),
      headers: await _headers(auth: false),
      body: jsonEncode({
        'email': email,
        'mot_de_passe': motDePasse,
      }),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode == 200) {
      await saveToken(data['token']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(data['user']));
      return data;
    }
    throw Exception(data['message'] ?? 'Erreur de connexion');
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/inscription'),
      headers: await _headers(auth: false),
      body: jsonEncode(data),
    );
    final responseData = jsonDecode(res.body);
    if (res.statusCode == 201) {
      return responseData;
    }
    throw Exception(responseData['message'] ?? 'Erreur d\'inscription');
  }

  // ── SECTEURS ──────────────────────────────────────────
  static Future<List<dynamic>> getSecteursPublic() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/secteurs/public'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is Map && data.containsKey('secteurs')) {
        return data['secteurs'] as List;
      }
      if (data is List) return data;
      return [];
    }
    throw Exception('Erreur chargement secteurs');
  }

  static Future<List<dynamic>> getTypesProjetPublic() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/admin/types-projet/public'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is Map && data.containsKey('types')) {
        return data['types'] as List;
      }
      if (data is List) return data;
      return [];
    }
    throw Exception('Erreur chargement types projet');
  }

  static Future<List<dynamic>> getDocumentsModeles(int typeId) async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/admin/types-projet/$typeId/documents-modeles'),
      headers: await _headers(auth: true),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is Map && data.containsKey('documents')) {
        return data['documents'] as List;
      }
      if (data is List) return data;
      return [];
    }
    throw Exception('Erreur chargement documents modèles');
  }


  // ── RÉGIONS & PAYS ────────────────────────────────────
  static Future<List<String>> getRegions() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/referentiels/regions'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is Map && data.containsKey('regions')) {
        return List<String>.from(data['regions']);
      }
    }
    return [];
  }

  static Future<List<String>> getPays() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/referentiels/pays'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is Map && data.containsKey('pays')) {
        return List<String>.from(data['pays']);
      }
    }
    return [];
  }

  // ── PROFIL ────────────────────────────────────────────
  static Future<Map<String, dynamic>> updateProfil(Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/api/me'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    final responseData = jsonDecode(res.body);
    if (res.statusCode == 200) {
      // Update local storage with the new user info if provided
      if (responseData.containsKey('user')) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(responseData['user']));
      }
      return responseData;
    }
    throw Exception(responseData['message'] ?? 'Erreur mise à jour profil');
  }

  static Future<void> updatePassword(Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/api/me/mot-de-passe'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) {
      final responseData = jsonDecode(res.body);
      throw Exception(responseData['message'] ?? 'Erreur mise à jour mot de passe');
    }
  }

  static Future<Map<String, dynamic>> uploadAvatar(String filePath) async {
    final token = await getToken();
    final request = http.MultipartRequest('PATCH', Uri.parse('$baseUrl/api/me/avatar'));
    request.headers['Authorization'] = 'Bearer $token';
    
    // Explicitly set media type as image to avoid application/octet-stream rejection by multer
    String ext = filePath.split('.').last.toLowerCase();
    String subType = (ext == 'png') ? 'png' : ((ext == 'webp') ? 'webp' : 'jpeg');
    
    request.files.add(await http.MultipartFile.fromPath(
      'avatar', 
      filePath,
      contentType: MediaType('image', subType),
    ));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    Map<String, dynamic> responseData;
    try {
      responseData = jsonDecode(response.body);
    } catch (e) {
      throw Exception('Erreur serveur (${response.statusCode}): Le format de l\'image n\'est peut-être pas supporté.');
    }

    if (response.statusCode == 200) {
      // Met à jour le stockage local
      if (responseData.containsKey('avatar_url')) {
        final prefs = await SharedPreferences.getInstance();
        final userStr = prefs.getString('user');
        if (userStr != null) {
          final user = jsonDecode(userStr);
          user['avatar_url'] = responseData['avatar_url'];
          await prefs.setString('user', jsonEncode(user));
        }
      }
      return responseData;
    }
    throw Exception(responseData['message'] ?? 'Erreur lors de l\'upload de l\'avatar');
  }

  static Future<Map<String, dynamic>> updatePreferences(bool notificationsEmail) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/api/me/preferences'),
      headers: await _headers(),
      body: jsonEncode({'notifications_email': notificationsEmail}),
    );
    final responseData = jsonDecode(res.body);
    if (res.statusCode == 200) {
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('user');
      if (userStr != null) {
        final user = jsonDecode(userStr);
        user['notifications_email'] = notificationsEmail;
        await prefs.setString('user', jsonEncode(user));
      }
      return responseData;
    }
    throw Exception(responseData['message'] ?? 'Erreur mise à jour préférences');
  }

  // ── APPELS À PROJETS ──────────────────────────────────
  static Future<List<dynamic>> getAppelsOuverts() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/appels?t=${DateTime.now().millisecondsSinceEpoch}'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      // Le backend renvoie { appels: [...] }
      if (data is Map && data.containsKey('appels')) {
        return data['appels'] as List;
      }
      if (data is List) return data;
      return [];
    }
    throw Exception('Erreur chargement appels');
  }

  static Future<List<dynamic>> getTousLesAppels() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/appels/tous?t=${DateTime.now().millisecondsSinceEpoch}'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      // Le backend renvoie { appels: [...] }
      if (data is Map && data.containsKey('appels')) {
        return data['appels'] as List;
      }
      if (data is List) return data;
      return [];
    }
    throw Exception('Erreur chargement appels');
  }

  static Future<Map<String, dynamic>> getDetailAppel(int id) async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/appels/$id'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      // Le backend renvoie { appel: {...} }
      if (data is Map && data.containsKey('appel')) {
        return data['appel'] as Map<String, dynamic>;
      }
      return data as Map<String, dynamic>;
    }
    throw Exception('Appel introuvable');
  }

  // Formulaire Appel
  static Future<int> etape1Appel(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/dossiers/etape1'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    final body = jsonDecode(res.body);
    if (res.statusCode == 201) return body['dossier_id'];
    throw Exception(body['error'] ?? body['message'] ?? 'Erreur étape 1');
  }

  static Future<void> etape2Appel(int id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/dossiers/$id/etape2'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) {
      final body = jsonDecode(res.body);
      throw Exception(body['error'] ?? body['message'] ?? 'Erreur étape 2');
    }
  }

  static Future<void> etape3Appel(int id, Map<String, String?> fichiers) async {
    final request = http.MultipartRequest(
      'PUT',
      Uri.parse('$baseUrl/api/dossiers/$id/etape3'),
    );
    final token = await getToken();
    request.headers['Authorization'] = 'Bearer $token';

    int fichierCount = 0;
    debugPrint('[DEBUG API] etape3Appel déclenché pour synchroniser tous les documents du dossier $id');
    for (var entry in fichiers.entries) {
      if (entry.value != null && !entry.value!.startsWith('document_')) {
        final safePath = _getSafePath(entry.value!);
        if (File(safePath).existsSync()) {
          debugPrint('[DEBUG API] - Ajout du fichier au payload avec la clé (fieldname) : "${entry.key}"');
          request.files.add(await http.MultipartFile.fromPath(entry.key, safePath));
          fichierCount++;
        }
      } else {
        debugPrint('[DEBUG API] - Fichier ignoré (déjà sur serveur ou null) pour la clé : "${entry.key}"');
      }
    }

    // Si aucun nouveau fichier local, on ne fait pas de requête (les docs serveur sont préservés)
    if (fichierCount == 0) return;

    final res = await request.send();
    if (res.statusCode != 200) throw Exception('Erreur upload documents');
  }

  static Future<void> uploadDocumentUniqueAppel(int id, String docType, String filePath) async {
    debugPrint('[DEBUG API] uploadDocumentUniqueAppel déclenché');
    debugPrint('[DEBUG API] - Dossier ID : $id');
    debugPrint('[DEBUG API] - docType envoyé (nom_document attendu par le backend) : "$docType"');
    debugPrint('[DEBUG API] - Fichier local : $filePath');

    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/dossiers/$id/upload-document'),
    );
    final token = await getToken();
    request.headers['Authorization'] = 'Bearer $token';

    request.fields['docType'] = docType;
    
    final safePath = _getSafePath(filePath);
    if (!File(safePath).existsSync()) {
      throw Exception('Fichier local introuvable : $safePath');
    }
    
    request.files.add(await http.MultipartFile.fromPath('fichier', safePath));

    final res = await request.send();
    if (res.statusCode != 200) {
      final respStr = await res.stream.bytesToString();
      throw Exception('Erreur upload document: $respStr');
    }
  }

  static String _getSafePath(String path) {
    if (File(path).existsSync()) return path;
    try {
      final bytes = latin1.encode(path);
      final decoded = utf8.decode(bytes);
      if (File(decoded).existsSync()) {
        return decoded;
      }
    } catch (_) {}
    return path;
  }

  static Future<void> soumettreAppel(int id) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/dossiers/$id/soumettre'),
      headers: await _headers(),
    );
    if (res.statusCode != 200) {
      try {
        final data = jsonDecode(res.body);
        throw Exception(data['message'] ?? data['error'] ?? 'Erreur ${res.statusCode}');
      } catch (e) {
        if (e is FormatException) {
          throw Exception('Erreur serveur ${res.statusCode} : Le serveur a retourné une réponse invalide.');
        }
        rethrow;
      }
    }
  }

  // ── MOBILITÉ ──────────────────────────────────────────
  static Future<Map<String, dynamic>> getProgrammeMobilite() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/mobilite/programme-infos'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      // Le backend renvoie { programme: {...} }
      if (data is Map && data.containsKey('programme')) {
        return data['programme'] as Map<String, dynamic>;
      }
      return data as Map<String, dynamic>;
    }
    throw Exception('Programme mobilité introuvable');
  }

  // Formulaire Mobilité
  static Future<int> etape1Mobilite(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/mobilite/etape1'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    final body = jsonDecode(res.body);
    if (res.statusCode == 200 || res.statusCode == 201) return body['projet_id'];
    throw Exception(body['message'] ?? 'Erreur étape 1');
  }

  static Future<void> etape2Mobilite(int id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/mobilite/$id/etape2'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) throw Exception('Erreur étape 2');
  }

  static Future<void> etape3Mobilite(int id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/mobilite/$id/etape3'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) throw Exception('Erreur étape 3');
  }

  static Future<void> etape4Mobilite(int id, Map<String, String?> fichiers) async {
    final request = http.MultipartRequest(
      'PUT',
      Uri.parse('$baseUrl/api/mobilite/$id/etape4'),
    );
    final token = await getToken();
    request.headers['Authorization'] = 'Bearer $token';

    int fichierCount = 0;
    for (var entry in fichiers.entries) {
      if (entry.value != null && !entry.value!.startsWith('document_')) {
        final safePath = _getSafePath(entry.value!);
        if (File(safePath).existsSync()) {
          request.files.add(await http.MultipartFile.fromPath(entry.key, safePath));
          fichierCount++;
        }
      }
    }

    // Si aucun nouveau fichier local, on ne fait pas de requête (les docs serveur sont préservés)
    if (fichierCount == 0) return;

    final res = await request.send();
    if (res.statusCode != 200) throw Exception('Erreur upload documents');
  }

  static Future<void> uploadDocumentUniqueMobilite(int id, String docType, String filePath) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/mobilite/$id/upload-document'),
    );
    final token = await getToken();
    request.headers['Authorization'] = 'Bearer $token';

    request.fields['docType'] = docType;
    
    final safePath = _getSafePath(filePath);
    if (!File(safePath).existsSync()) {
      throw Exception('Fichier local introuvable : $safePath');
    }
    
    request.files.add(await http.MultipartFile.fromPath('fichier', safePath));

    final res = await request.send();
    if (res.statusCode != 200) {
      final respStr = await res.stream.bytesToString();
      throw Exception('Erreur upload document: $respStr');
    }
  }

  static Future<void> soumettreMobilite(int id) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/mobilite/$id/soumettre'),
      headers: await _headers(),
    );
    if (res.statusCode != 200) {
      try {
        final data = jsonDecode(res.body);
        throw Exception(data['message'] ?? data['error'] ?? 'Erreur ${res.statusCode}');
      } catch (e) {
        if (e is FormatException) {
          throw Exception('Erreur serveur ${res.statusCode} : Le serveur a retourné une réponse invalide.');
        }
        rethrow;
      }
    }
  }

  // ── MES DOSSIERS ──────────────────────────────────────
  static Future<List<dynamic>> getMesDossiers() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/dossiers/mes-dossiers'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      // Le backend renvoie { dossiers: [...] }
      if (data is Map && data.containsKey('dossiers')) {
        return data['dossiers'] as List;
      }
      if (data is List) return data;
      return [];
    }
    throw Exception('Erreur chargement dossiers');
  }

  static Future<List<dynamic>> getMesProjets() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/mobilite/mes-projets'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      // Le backend renvoie { projets: [...] }
      if (data is Map && data.containsKey('projets')) {
        return data['projets'] as List;
      }
      if (data is List) return data;
      return [];
    }
    throw Exception('Erreur chargement projets mobilité');
  }

  // ── NOTIFICATIONS ─────────────────────────────────────
  static Future<List<dynamic>> getNotifications() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/notifications'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      // Le backend renvoie { data: [...] }
      if (data is Map && data.containsKey('data')) {
        return data['data'] as List;
      }
      if (data is List) return data;
      return [];
    }
    throw Exception('Erreur chargement notifications');
  }

  static Future<void> marquerCommeLu(int id) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/notifications/$id/lu'),
      headers: await _headers(),
    );
    if (res.statusCode != 200) {
      throw Exception('Erreur marquage notification');
    }
  }

  static Future<void> toutMarquerCommeLu() async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/notifications/tout-lire'),
      headers: await _headers(),
    );
    if (res.statusCode != 200) {
      throw Exception('Erreur marquage notifications');
    }
  }
}
