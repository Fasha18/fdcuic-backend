import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/user_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepository(apiClient);
});

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _apiClient.post('/auth/connexion', data: {
        'email': email,
        'mot_de_passe': password,
      });
      return {
        'token': response.data['token'],
        'user': UserModel.fromJson(response.data['user']),
      };
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? 'Erreur de connexion';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Erreur inattendue : $e');
    }
  }

  Future<void> register({
    required String nom,
    required String prenom,
    required String email,
    required String telephone,
    required String password,
    required String confirmPassword,
  }) async {
    try {
      await _apiClient.post('/auth/inscription', data: {
        'nom': nom,
        'prenom': prenom,
        'email': email,
        'telephone': telephone,
        'mot_de_passe': password,
        'confirmation_mot_de_passe': confirmPassword,
      });
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? 'Erreur lors de l\\'inscription';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Erreur inattendue : $e');
    }
  }
}
