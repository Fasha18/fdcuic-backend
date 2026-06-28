import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../projects/providers/projet_provider.dart';
import 'package:intl/intl.dart';

class ApplicationsScreen extends ConsumerStatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  ConsumerState<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends ConsumerState<ApplicationsScreen> {
  String _selectedFilter = 'Toutes';
  final List<String> _filters = ['Toutes', 'En cours', 'Acceptées', 'Refusées'];

  @override
  Widget build(BuildContext context) {
    final projetsAsyncValue = ref.watch(mesProjetsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes candidatures'),
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: false,
      ),
      body: Column(
        children: [
          _buildFilters(),
          Expanded(
            child: projetsAsyncValue.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(child: Text('Erreur: $error')),
              data: (projets) {
                final filteredList = projets.where((p) {
                  if (_selectedFilter == 'Toutes') return true;
                  if (_selectedFilter == 'En cours' && p.statut == 'soumis') return true;
                  if (_selectedFilter == 'Acceptées' && p.statut == 'accepte') return true;
                  if (_selectedFilter == 'Refusées' && p.statut == 'refuse') return true;
                  return false;
                }).toList();

                if (filteredList.isEmpty) {
                  return const Center(child: Text('Aucune candidature trouvée.'));
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(24),
                  itemCount: filteredList.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final projet = filteredList[index];
                    return _buildApplicationCard(projet);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Row(
        children: _filters.map((filter) {
          final isSelected = _selectedFilter == filter;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: FilterChip(
              label: Text(filter),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  _selectedFilter = filter;
                });
              },
              backgroundColor: Colors.white,
              selectedColor: AppColors.primary,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildApplicationCard(projet) {
    Color statusColor;
    IconData statusIcon;
    String statusText;

    switch (projet.statut) {
      case 'accepte':
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle;
        statusText = 'Acceptées';
        break;
      case 'refuse':
        statusColor = AppColors.error;
        statusIcon = Icons.cancel;
        statusText = 'Refusées';
        break;
      default:
        statusColor = AppColors.warning;
        statusIcon = Icons.hourglass_empty;
        statusText = 'En cours';
        break;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(statusIcon, size: 14, color: statusColor),
                    const SizedBox(width: 4),
                    Text(
                      statusText,
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            projet.titre,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Budget: ${NumberFormat.currency(locale: 'fr_FR', symbol: 'FCFA').format(projet.budgetPrevisionnel)}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
