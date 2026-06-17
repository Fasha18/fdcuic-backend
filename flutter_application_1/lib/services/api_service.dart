import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // L'adresse IP est redirigée directement via ADB (adb reverse)
  static const String baseUrl = 'https://fdcuic-backend-production.up.railway.app';
  // static const String baseUrl = 'http://TON_IP:3000/api'; // vrai téléphone

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

  // ── APPELS À PROJETS ──────────────────────────────────
  static Future<List<dynamic>> getAppelsOuverts() async {
    final res = await http.get(
      Uri.parse('$baseUrl/appels'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) return jsonDecode(res.body) as List;
    throw Exception('Erreur chargement appels');
  }

  static Future<List<dynamic>> getTousLesAppels() async {
    final res = await http.get(
      Uri.parse('$baseUrl/appels/tous'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body) as List;
    throw Exception('Erreur chargement appels');
  }

  static Future<Map<String, dynamic>> getDetailAppel(int id) async {
    final res = await http.get(
      Uri.parse('$baseUrl/appels/$id'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) return jsonDecode(res.body) as Map<String, dynamic>;
    throw Exception('Appel introuvable');
  }

  // Formulaire Appel
  static Future<int> etape1Appel(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/dossiers/etape1'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    final body = jsonDecode(res.body);
    if (res.statusCode == 201) return body['dossier_id'];
    throw Exception(body['message'] ?? 'Erreur étape 1');
  }

  static Future<void> etape2Appel(int id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/dossiers/$id/etape2'),
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
      Uri.parse('$baseUrl/dossiers/$id/etape3'),
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
      Uri.parse('$baseUrl/dossiers/$id/soumettre'),
      headers: await _headers(),
    );
    if (res.statusCode != 200) throw Exception('Erreur lors de la soumission');
  }

  // ── MOBILITÉ ──────────────────────────────────────────
  static Future<Map<String, dynamic>> getProgrammeMobilite() async {
    final res = await http.get(
      Uri.parse('$baseUrl/mobilite/programme'),
      headers: await _headers(auth: false),
    );
    if (res.statusCode == 200) return jsonDecode(res.body) as Map<String, dynamic>;
    throw Exception('Programme mobilité introuvable');
  }

  // Formulaire Mobilité
  static Future<int> etape1Mobilite(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/mobilite/etape1'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    final body = jsonDecode(res.body);
    if (res.statusCode == 201) return body['projet_id'];
    throw Exception(body['message'] ?? 'Erreur étape 1');
  }

  static Future<void> etape2Mobilite(int id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/mobilite/$id/etape2'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) throw Exception('Erreur étape 2');
  }

  static Future<void> etape3Mobilite(int id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/mobilite/$id/etape3'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) throw Exception('Erreur étape 3');
  }

  static Future<void> etape4Mobilite(int id, Map<String, String?> fichiers) async {
    final request = http.MultipartRequest(
      'PUT',
      Uri.parse('$baseUrl/mobilite/$id/etape4'),
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
      Uri.parse('$baseUrl/mobilite/$id/soumettre'),
      headers: await _headers(),
    );
    if (res.statusCode != 200) throw Exception('Erreur lors de la soumission');
  }

  // ── MES DOSSIERS ──────────────────────────────────────
  static Future<List<dynamic>> getMesDossiers() async {
    final res = await http.get(
      Uri.parse('$baseUrl/dossiers/mes-dossiers'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body) as List;
    throw Exception('Erreur chargement dossiers');
  }

  static Future<List<dynamic>> getMesProjets() async {
    final res = await http.get(
      Uri.parse('$baseUrl/mobilite/mes-projets'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body) as List;
    throw Exception('Erreur chargement projets mobilité');
  }
}
