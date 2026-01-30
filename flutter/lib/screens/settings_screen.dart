import 'package:flutter/material.dart';
import 'package:zutsu_log/theme/app_colors.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // 設定状態
  bool _pressureAlert = true;
  bool _cautionAlert = false;
  bool _medicationReminder = false;
  String _sensitivity = 'normal';
  String _prefecture = '東京都';
  String _city = '千代田区';

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
                  children: [
                    _buildPremiumBanner(),
                    const SizedBox(height: 24),
                    _buildLocationSection(),
                    const SizedBox(height: 24),
                    _buildNotificationSection(),
                    const SizedBox(height: 24),
                    _buildMedicationSection(),
                    const SizedBox(height: 40),
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
          '設定',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
          ),
        ),
      ),
    );
  }

  Widget _buildPremiumBanner() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.primaryLight.withOpacity(0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.workspace_premium_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'プレミアムにアップグレード',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '広告なし、複数地点、詳細分析',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSub,
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right_rounded,
            color: AppColors.textMuted,
          ),
        ],
      ),
    );
  }

  Widget _buildLocationSection() {
    return _buildSection(
      title: '地域設定',
      icon: Icons.location_on_outlined,
      children: [
        _buildSelectItem(
          label: '都道府県',
          value: _prefecture,
          onTap: () => _showPrefectureSelector(),
        ),
        _buildSelectItem(
          label: '市区町村',
          value: _city,
          onTap: () => _showCitySelector(),
        ),
      ],
    );
  }

  Widget _buildNotificationSection() {
    return _buildSection(
      title: '通知設定',
      icon: Icons.notifications_outlined,
      children: [
        _buildSwitchItem(
          label: '気圧警戒アラート',
          description: '気圧が急激に変化する前に通知',
          value: _pressureAlert,
          onChanged: (v) => setState(() => _pressureAlert = v),
        ),
        _buildSwitchItem(
          label: '注意レベル通知',
          description: '注意レベルでも通知を受け取る',
          value: _cautionAlert,
          onChanged: (v) => setState(() => _cautionAlert = v),
        ),
        _buildSelectItem(
          label: '感度',
          value: _getSensitivityLabel(_sensitivity),
          onTap: () => _showSensitivitySelector(),
        ),
      ],
    );
  }

  Widget _buildMedicationSection() {
    return _buildSection(
      title: '服薬管理',
      icon: Icons.medication_outlined,
      children: [
        _buildSwitchItem(
          label: '服薬リマインダー',
          description: '設定した時間に通知',
          value: _medicationReminder,
          onChanged: (v) => setState(() => _medicationReminder = v),
        ),
        if (_medicationReminder)
          _buildSelectItem(
            label: 'スケジュール',
            value: '08:00, 20:00',
            onTap: () {},
          ),
      ],
    );
  }

  Widget _buildSection({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(icon, color: AppColors.textMuted, size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textSub,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.divider),
          ...children,
        ],
      ),
    );
  }

  Widget _buildSwitchItem({
    required String label,
    required String description,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMain,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildSelectItem({
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: AppColors.textMain,
              ),
            ),
            Row(
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSub,
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.textMuted,
                  size: 20,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getSensitivityLabel(String value) {
    switch (value) {
      case 'low':
        return '低';
      case 'high':
        return '高';
      default:
        return '標準';
    }
  }

  void _showPrefectureSelector() {
    // TODO: 都道府県選択ダイアログ
  }

  void _showCitySelector() {
    // TODO: 市区町村選択ダイアログ
  }

  void _showSensitivitySelector() {
    // TODO: 感度選択ダイアログ
  }
}
