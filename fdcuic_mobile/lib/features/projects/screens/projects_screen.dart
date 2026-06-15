import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

class ProjectsScreen extends StatelessWidget {
  const ProjectsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Simulated dynamic data from backend
    final List<Map<String, dynamic>> projects = [
      {
        'id': '1',
        'title': 'Fonds d\'Innovation Technologique',
        'description': 'Soutien aux startups développant des solutions DeepTech.',
        'deadline': '30 Juin 2026',
        'status': 'Ouvert',
        'image': Icons.biotech,
      },
      {
        'id': '2',
        'title': 'Green Entrepreneurship',
        'description': 'Financement pour les projets à impact environnemental positif.',
        'deadline': '15 Juillet 2026',
        'status': 'Ouvert',
        'image': Icons.eco,
      },
      {
        'id': '3',
        'title': 'Tech for Good',
        'description': 'Appel à projets pour l\'innovation sociale.',
        'deadline': '1 Août 2026',
        'status': 'Bientôt',
        'image': Icons.favorite,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Appels à projets'),
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: false,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: projects.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final project = projects[index];
          return _buildProjectCard(context, project);
        },
      ),
    );
  }

  Widget _buildProjectCard(BuildContext context, Map<String, dynamic> project) {
    final bool isOpen = project['status'] == 'Ouvert';

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 5),
          )
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            context.push('/projects/details/${project['id']}');
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(project['image'] as IconData, color: AppColors.primary, size: 32),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isOpen ? AppColors.success.withOpacity(0.1) : AppColors.warning.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  project['status'],
                                  style: TextStyle(
                                    color: isOpen ? AppColors.success : AppColors.warning,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              Text(
                                'Fin : ${project['deadline']}',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            project['title'],
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  project['description'],
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {
                      context.push('/projects/details/${project['id']}');
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Voir les détails'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
