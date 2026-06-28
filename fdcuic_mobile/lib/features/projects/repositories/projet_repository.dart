import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/projet_model.dart';
import '../models/appel_model.dart';

final projetRepositoryProvider = Provider<ProjetRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProjetRepository(apiClient);
});

class ProjetRepository {
  final ApiClient _apiClient;

  ProjetRepository(this._apiClient);

  Future<List<ProjetModel>> getMesProjets() async {
    try {
      final response = await _apiClient.get('/projets/mes-projets');
      if (response.data['data'] != null) {
        final List data = response.data['data'];
        return data.map((json) => ProjetModel.fromJson(json)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Erreur lors de la récupération des projets');
    }
  }

  Future<ProjetModel> getProjetDetail(int id) async {
    try {
      final response = await _apiClient.get('/projets/$id');
      if (response.data['data'] != null) {
        return ProjetModel.fromJson(response.data['data']);
      }
      throw Exception('Projet non trouvé');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Erreur lors de la récupération du projet');
    }
  }

  Future<List<AppelModel>> getAppels() async {
    try {
      final response = await _apiClient.get('/appels');
      if (response.data['appels'] != null) {
        final List data = response.data['appels'];
        return data.map((json) => AppelModel.fromJson(json)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Erreur lors de la récupération des appels');
    }
  }

  Future<AppelModel> getAppelDetail(int id) async {
    try {
      final response = await _apiClient.get('/appels/$id');
      if (response.data['appel'] != null) {
        return AppelModel.fromJson(response.data['appel']);
      }
      throw Exception('Appel à projets non trouvé');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Erreur lors de la récupération du détail de l\\'appel');
    }
  }
}
