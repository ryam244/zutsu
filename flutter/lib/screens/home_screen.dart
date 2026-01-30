import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:zutsu_log/theme/app_colors.dart';
import 'package:zutsu_log/models/weather_data.dart';
import 'package:zutsu_log/models/health_log.dart';
import 'package:zutsu_log/widgets/pressure_card.dart';
import 'package:zutsu_log/widgets/severity_button.dart';
import 'package:intl/intl.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoading = true;
  WeatherData? _weatherData;
  SeverityLevel? _selectedSeverity;

  // 設定（後でProviderから取得）
  final String _prefecture = '東京都';
  final String _city = '千代田区';

  @override
  void initState() {
    super.initState();
    _loadWeatherData();
  }

  Future<void> _loadWeatherData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    try {
      // TODO: 実際のAPIから取得（WeatherService.fetchWeatherData）
      await Future.delayed(const Duration(milliseconds: 500));

      if (!mounted) return;
      setState(() {
        _weatherData = WeatherData.fallback();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Weather load error: $e');
      if (!mounted) return;
      setState(() {
        _weatherData = WeatherData.fallback();
        _isLoading = false;
      });
    }
  }

  void _onSeveritySelected(SeverityLevel level) {
    setState(() => _selectedSeverity = level);
    // TODO: Firebaseに保存
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('体調を記録しました: ${SeverityInfo.all[level.index].label}'),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final dateString = DateFormat('M月d日').format(today);

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            // ヘッダー
            _buildHeader(dateString),

            // コンテンツ
            Expanded(
              child: _isLoading
                  ? _buildLoading()
                  : _buildContent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(String dateString) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: const BoxDecoration(
        color: AppColors.surfaceGlass,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Text('📍', style: TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Text(
                '$_prefecture $_city • $dateString',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
            ],
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.notifications_outlined,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoading() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primary),
          SizedBox(height: 16),
          Text(
            '気象データを取得中...',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSub,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final status = _weatherData?.status ?? PressureStatus.stable;
    final statusMessage = StatusMessage.fromStatus(status);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 気圧アラート
          _buildAlertSection(status, statusMessage),

          const SizedBox(height: 24),

          // 気圧カード
          PressureCard(
            weatherData: _weatherData!,
            statusMessage: statusMessage,
          ),

          const SizedBox(height: 24),

          // 体調記録
          _buildHealthSection(),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildAlertSection(PressureStatus status, StatusMessage message) {
    if (status == PressureStatus.stable) {
      return _buildStableAlert(message);
    }
    return _buildWarningAlert(status, message);
  }

  Widget _buildWarningAlert(PressureStatus status, StatusMessage message) {
    final isDanger = status == PressureStatus.danger;
    final bgColor = isDanger
        ? AppColors.danger.withOpacity(0.1)
        : AppColors.caution.withOpacity(0.1);
    final borderColor = isDanger
        ? AppColors.danger.withOpacity(0.3)
        : AppColors.caution.withOpacity(0.3);
    final textColor = isDanger ? AppColors.dangerText : AppColors.cautionText;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('⚠️', style: TextStyle(fontSize: 12)),
              const SizedBox(width: 6),
              Text(
                isDanger ? '気圧警戒' : '気圧注意',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          message.forecast,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
            height: 1.3,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '${message.advice}リスク：${message.risk}',
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textSub,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildStableAlert(StatusMessage message) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.stable.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.stable.withOpacity(0.3)),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('✨', style: TextStyle(fontSize: 12)),
              SizedBox(width: 6),
              Text(
                '気圧安定',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          message.forecast,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
            height: 1.3,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          message.advice,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textSub,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildHealthSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '今の体調はどうですか？',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
          ),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.3,
          children: SeverityInfo.all.map((info) {
            return SeverityButton(
              info: info,
              isSelected: _selectedSeverity == info.level,
              onTap: () => _onSeveritySelected(info.level),
            );
          }).toList(),
        ),
      ],
    );
  }
}
