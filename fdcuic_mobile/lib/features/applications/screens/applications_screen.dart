import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class ApplicationsScreen extends StatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  State<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends State<ApplicationsScreen> {
  String _selectedFilter = 'Toutes';
  final List<String> _filters = ['Toutes', 'En cours', 'Acceptées', 'Refusées'];

  final List<Map<String, dynamic>> _applications = [
    {
      'title': 'Fonds d\'Innovation Technologique',
      'type': 'Projet',
      'status': 'En cours',
      'date': '12 Mai 2026',
    },
    {
      'title': 'Global Exchange 2026',
      'type': 'Mobilité',
      'status': 'Acceptées',
      'date': '05 Fév 2026',
    },
    {
      'title': 'Green Entrepreneurship',
      'type': 'Projet',
      'status': 'Refusées',
      'date': '10 Déc 2025',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredList = _selectedFilter == 'Toutes'
        ? _applications
        : _applications.where((app) => app['status'] == _selectedFilter).toList();

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
            child: ListView.separated(
              padding: const EdgeInsets.all(24),
              itemCount: filteredList.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final app = filteredList[index];
                return _buildApplicationCard(app);
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

  Widget _buildApplicationCard(Map<String, dynamic> app) {
    Color statusColor;
    IconData statusIcon;

    switch (app['status']) {
      case 'Acceptées':
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle;
        break;
      case 'Refusées':
        statusColor = AppColors.error;
        statusIcon = Icons.cancel;
        break;
      case 'En cours':
      default:
        statusColor = AppColors.warning;
        statusIcon = Icons.hourglass_empty;
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
                      app['status'],
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                app['date'],
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            app['title'],
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Type : ${app['type']}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
