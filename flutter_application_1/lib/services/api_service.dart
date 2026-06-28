import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // L'adresse IP est redirigée directement via ADB (adb reverse)
  static const String baseUrl = 'https://fdcuic-backend-production.up.railway.app';
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

  // ── PROFIL ────────────────────────────────────────────
  static Future<Map<String, dynamic>> updateProfil(Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/users'),
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
    final res = await http.put(
      Uri.parse('$baseUrl/api/users/password'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) {
      final responseData = jsonDecode(res.body);
      throw Exception(responseData['message'] ?? 'Erreur mise à jour mot de passe');
    }
  }

  // ── APPELS À PROJETS ──────────────────────────────────
  static Future<List<dynamic>> getAppelsOuverts() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/appels'),
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
      Uri.parse('$baseUrl/api/appels/tous'),
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
    throw Exception(body['message'] ?? 'Erreur étape 1');
  }

  static Future<void> etape2Appel(int id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/dossiers/$id/etape2'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) {
      final body = jsonDecode(res.body);
      throw Exception(body['message'] ?? 'Erreur étape 2');
    }
  }

  static Future<void> etape3Appel(int id, Map<String, String?> fichiers) async {
    final request = http.MultipartRequest(
      'PUT',
      Uri.parse('$baseUrl/api/dossiers/$id/etape3'),
    );
    final token = await getToken();
    request.headers['Authorization'] = 'Bearer $token';

    for (var entry in fichiers.entries) {
      if (entry.value != null && !entry.value!.startsWith('document_')) {
        request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value!));
      }
    }

    final res = await request.send();
    if (res.statusCode != 200) throw Exception('Erreur upload documents');
  }

  static Future<void> soumettreAppel(int id) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/dossiers/$id/soumettre'),
      headers: await _headers(),
    );
    if (res.statusCode != 200) throw Exception('Erreur lors de la soumission');
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

    for (var entry in fichiers.entries) {
      if (entry.value != null && !entry.value!.startsWith('document_')) {
        request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value!));
      }
    }

    final res = await request.send();
    if (res.statusCode != 200) throw Exception('Erreur upload documents');
  }

  static Future<void> soumettreMobilite(int id) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/mobilite/$id/soumettre'),
      headers: await _headers(),
    );
    if (res.statusCode != 200) throw Exception('Erreur lors de la soumission');
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
