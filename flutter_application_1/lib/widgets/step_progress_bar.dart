import 'package:flutter/material.dart';
import '../core/theme.dart';

/// Barre d'étapes visuelle — cercles numérotés + lignes de connexion.
///
/// [currentStep] est 1-indexé (1 = première étape).
class StepProgressBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String>? labels;
  final Color activeColor;
  final Color completedColor;
  final Color inactiveColor;

  const StepProgressBar({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    this.labels,
    this.activeColor = FDColors.royal,
    this.completedColor = FDColors.mint,
    this.inactiveColor = FDColors.silver,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Row(
        children: List.generate(totalSteps * 2 - 1, (index) {
          // Index pair = cercle, impair = ligne
          if (index.isEven) {
            final stepIndex = index ~/ 2 + 1; // 1-indexé
            return _buildCircle(stepIndex);
          } else {
            final beforeStep = index ~/ 2 + 1;
            return _buildLine(beforeStep);
          }
        }),
      ),
    );
  }

  Widget _buildCircle(int step) {
    final isCompleted = step < currentStep;
    final isActive = step == currentStep;

    final Color bgColor;
    final Color borderColor;
    final Widget child;

    if (isCompleted) {
      bgColor = completedColor;
      borderColor = completedColor;
      child = const Icon(Icons.check_rounded, size: 14, color: FDColors.white);
    } else if (isActive) {
      bgColor = activeColor;
      borderColor = activeColor;
      child = Text(
        '$step',
        style: const TextStyle(
          color: FDColors.white,
          fontSize: 11,
          fontWeight: FontWeight.w800,
        ),
      );
    } else {
      bgColor = Colors.transparent;
      borderColor = inactiveColor;
      child = Text(
        '$step',
        style: TextStyle(
          color: inactiveColor,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      );
    }

    final circle = Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        border: Border.all(color: borderColor, width: 2),
        boxShadow: (isActive || isCompleted)
            ? [
                BoxShadow(
                  color: bgColor.withValues(alpha: 0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      alignment: Alignment.center,
      child: child,
    );

    // Avec label optionnel
    if (labels != null && step - 1 < labels!.length) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          circle,
          const SizedBox(height: 4),
          SizedBox(
            width: 56,
            child: Text(
              labels![step - 1],
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 9,
                fontWeight:
                    isActive ? FontWeight.w700 : FontWeight.w400,
                color: isActive || isCompleted
                    ? FDColors.white
                    : FDColors.white.withValues(alpha: 0.5),
              ),
            ),
          ),
        ],
      );
    }

    return circle;
  }

  Widget _buildLine(int beforeStep) {
    final isCompleted = beforeStep < currentStep;
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: BoxDecoration(
          color: isCompleted ? completedColor : inactiveColor.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(1),
        ),
      ),
    );
  }
}
