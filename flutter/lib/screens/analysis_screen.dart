import 'package:flutter/material.dart';
import 'package:zutsu_log/theme/app_colors.dart';

class AnalysisScreen extends StatelessWidget {
  const AnalysisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildPlaceholder(),
                    const SizedBox(height: 24),
                    _buildFeatureList(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      decoration: const BoxDecoration(
        color: AppColors.surfaceGlass,
        border: Border(
          bottom: BorderSide(color: AppColors.divider),
        ),
      ),
      child: const Center(
        child: Text(
          '分析',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          const Text(
            '📊',
            style: TextStyle(fontSize: 48),
          ),
          const SizedBox(height: 16),
          const Text(
            '分析機能',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Phase 2 で実装予定',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '記録データが蓄積されると、詳細な分析が可能になります',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textSub,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureList() {
    final features = [
      ('📈', '気圧変動パターンの分析'),
      ('🎯', 'トリガーの自動検出'),
      ('📅', '月別・季節別の傾向'),
      ('🏥', '医療機関向けレポート出力'),
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '今後追加予定の機能',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textSub,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 16),
          ...features.map((feature) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                children: [
                  Text(feature.$1, style: const TextStyle(fontSize: 20)),
                  const SizedBox(width: 16),
                  Text(
                    feature.$2,
                    style: const TextStyle(
                      fontSize: 15,
                      color: AppColors.textMain,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
