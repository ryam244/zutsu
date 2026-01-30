import 'package:flutter/material.dart';
import 'package:zutsu_log/theme/app_colors.dart';
import 'package:zutsu_log/models/weather_data.dart';

class PressureCard extends StatelessWidget {
  final WeatherData weatherData;
  final StatusMessage statusMessage;

  const PressureCard({
    super.key,
    required this.weatherData,
    required this.statusMessage,
  });

  @override
  Widget build(BuildContext context) {
    final status = weatherData.status;
    final statusColors = PressureStatusColors.fromStatus(status);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // 気圧ヘッダー
          _buildHeader(status, statusColors),

          const SizedBox(height: 20),

          // グラフプレースホルダー
          _buildGraphPlaceholder(),

          const SizedBox(height: 12),

          // 時間ラベル
          _buildTimeLabels(),

          const SizedBox(height: 16),

          // 凡例
          _buildLegend(),
        ],
      ),
    );
  }

  Widget _buildHeader(PressureStatus status, PressureStatusColors colors) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '現在の気圧',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppColors.textMuted,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  '${weatherData.pressure.toInt()}',
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(width: 4),
                const Text(
                  'hPa',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ],
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: colors.bgLight,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(statusMessage.icon, style: const TextStyle(fontSize: 12)),
                  const SizedBox(width: 4),
                  Text(
                    '${weatherData.pressureChange}%',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: colors.text,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              statusMessage.changeLabel,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildGraphPlaceholder() {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        color: AppColors.bgSoft,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '📈 気圧グラフ',
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textMuted,
              ),
            ),
            SizedBox(height: 4),
            Text(
              '24時間の気圧変動を表示',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textLight,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeLabels() {
    const labels = ['現在', '6h後', '12h後', '18h後', '24h後'];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: labels.map((label) {
        return Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: AppColors.textLight,
          ),
        );
      }).toList(),
    );
  }

  Widget _buildLegend() {
    return Row(
      children: [
        _buildLegendItem('警戒', AppColors.danger),
        const SizedBox(width: 20),
        _buildLegendItem('注意', AppColors.caution),
        const SizedBox(width: 20),
        _buildLegendItem('安定', AppColors.stable),
      ],
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}
