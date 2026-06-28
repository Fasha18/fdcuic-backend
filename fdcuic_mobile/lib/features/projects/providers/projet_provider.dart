import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/projet_model.dart';
import '../models/appel_model.dart';
import '../repositories/projet_repository.dart';

final mesProjetsProvider = FutureProvider.autoDispose<List<ProjetModel>>((ref) async {
  final repository = ref.watch(projetRepositoryProvider);
  return repository.getMesProjets();
});

final projetDetailProvider = FutureProvider.autoDispose.family<ProjetModel, int>((ref, id) async {
  final repository = ref.watch(projetRepositoryProvider);
  return repository.getProjetDetail(id);
});

final appelsProvider = FutureProvider.autoDispose<List<AppelModel>>((ref) async {
  final repository = ref.watch(projetRepositoryProvider);
  return repository.getAppels();
});

final appelDetailProvider = FutureProvider.autoDispose.family<AppelModel, int>((ref, id) async {
  final repository = ref.watch(projetRepositoryProvider);
  return repository.getAppelDetail(id);
});
