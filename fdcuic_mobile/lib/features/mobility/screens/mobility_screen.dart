import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

class MobilityScreen extends StatelessWidget {
  const MobilityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250.0,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: AppColors.secondary.withOpacity(0.1),
                child: const Center(
                  child: Icon(Icons.public, size: 80, color: AppColors.secondary),
                ),
              ),
            ),
            backgroundColor: AppColors.background,
            title: Text(
              'Programme Mobilité',
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Actif',
                        style: TextStyle(
                          color: AppColors.success,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Global Exchange 2026',
                      style: Theme.of(context).textTheme.displayMedium,
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow(context, Icons.calendar_today, 'Date limite', '15 Septembre 2026'),
                    const SizedBox(height: 8),
                    _buildInfoRow(context, Icons.flight_takeoff, 'Départ prévu', 'Janvier 2027'),
                    const SizedBox(height: 32),
                    Text('Description', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text(
                      'Le programme Global Exchange permet aux étudiants et jeunes entrepreneurs de passer 6 mois au sein d\'un incubateur partenaire à l\'international (Canada, France, ou Singapour) pour accélérer le développement de leur projet.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text('Objectifs', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    _buildListItem(context, 'Découvrir un nouvel écosystème d\'innovation'),
                    _buildListItem(context, 'Créer des partenariats internationaux'),
                    _buildListItem(context, 'Renforcer ses compétences interculturelles'),
                    const SizedBox(height: 24),
                    Text('Critères d\'éligibilité', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    _buildListItem(context, 'Être étudiant ou jeune diplômé (< 3 ans)'),
                    _buildListItem(context, 'Avoir un projet structuré ou une startup en création'),
                    _buildListItem(context, 'Niveau d\'anglais B2 minimum'),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            )
          ],
        ),
        child: ElevatedButton(
          onPressed: () {
            context.push('/mobility/apply');
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.secondary,
            minimumSize: const Size(double.infinity, 56),
          ),
          child: const Text('Déposer ma candidature'),
        ),
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppColors.secondary, size: 20),
        const SizedBox(width: 8),
        Text(
          '$label :',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ],
    );
  }

  Widget _buildListItem(BuildContext context, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, color: AppColors.secondary, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
