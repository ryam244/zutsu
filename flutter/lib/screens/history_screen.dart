import 'package:flutter/material.dart';
import 'package:zutsu_log/theme/app_colors.dart';
import 'package:zutsu_log/models/health_log.dart';
import 'package:intl/intl.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _selectedPeriod = '週間';

  // モックデータ
  final List<_HistoryItem> _mockHistory = [
    _HistoryItem(
      date: DateTime.now().subtract(const Duration(hours: 2)),
      severity: SeverityLevel.mild,
      pressure: 1008,
      pressureChange: -3.2,
    ),
    _HistoryItem(
      date: DateTime.now().subtract(const Duration(hours: 8)),
      severity: SeverityLevel.moderate,
      pressure: 1005,
      pressureChange: -5.1,
    ),
    _HistoryItem(
      date: DateTime.now().subtract(const Duration(days: 1)),
      severity: SeverityLevel.none,
      pressure: 1015,
      pressureChange: 0.5,
    ),
    _HistoryItem(
      date: DateTime.now().subtract(const Duration(days: 2)),
      severity: SeverityLevel.severe,
      pressure: 1002,
      pressureChange: -8.3,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildCorrelationCard(),
                    const SizedBox(height: 24),
                    _buildPeriodSelector(),
                    const SizedBox(height: 16),
                    _buildTimeline(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
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
          '記録履歴',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
          ),
        ),
      ),
    );
  }

  Widget _buildCorrelationCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.insights_rounded,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                '気圧との相関',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _CorrelationStat(label: '記録数', value: '28', unit: '件'),
              _CorrelationStat(label: '相関係数', value: '0.72', unit: ''),
              _CorrelationStat(label: '平均気圧差', value: '-4.2', unit: 'hPa'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodSelector() {
    return Row(
      children: ['週間', '月間'].map((period) {
        final isSelected = _selectedPeriod == period;
        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: GestureDetector(
            onTap: () => setState(() => _selectedPeriod = period),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                ),
              ),
              child: Text(
                period,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : AppColors.textSub,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTimeline() {
    return Column(
      children: _mockHistory.asMap().entries.map((entry) {
        final index = entry.key;
        final item = entry.value;
        final isLast = index == _mockHistory.length - 1;

        return _TimelineItem(item: item, isLast: isLast);
      }).toList(),
    );
  }
}

class _CorrelationStat extends StatelessWidget {
  final String label;
  final String value;
  final String unit;

  const _CorrelationStat({
    required this.label,
    required this.value,
    required this.unit,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textMuted,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            if (unit.isNotEmpty)
              Text(
                unit,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textMuted,
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _HistoryItem {
  final DateTime date;
  final SeverityLevel severity;
  final double pressure;
  final double pressureChange;

  _HistoryItem({
    required this.date,
    required this.severity,
    required this.pressure,
    required this.pressureChange,
  });
}

class _TimelineItem extends StatelessWidget {
  final _HistoryItem item;
  final bool isLast;

  const _TimelineItem({
    required this.item,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    final severityInfo = SeverityInfo.all[item.severity.index];
    final severityColors = SeverityColors.fromLevel(item.severity);
    final timeString = _formatTime(item.date);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // タイムライン線
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: severityColors.bg,
                  shape: BoxShape.circle,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppColors.divider,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          // カード
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.divider),
              ),
              child: Row(
                children: [
                  Text(
                    severityInfo.emoji,
                    style: const TextStyle(fontSize: 32),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          severityInfo.label,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textDark,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${item.pressure.toInt()}hPa (${item.pressureChange > 0 ? '+' : ''}${item.pressureChange}%)',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSub,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    timeString,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes}分前';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}時間前';
    } else {
      return DateFormat('M/d').format(date);
    }
  }
}
