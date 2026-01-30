import 'package:flutter/material.dart';

/// Zutsu-Log カラーパレット
/// デザインデータから抽出した色定義
class AppColors {
  AppColors._();

  // プライマリカラー
  static const Color primary = Color(0xFF4A90E2);
  static const Color primaryLight = Color(0xFF60A5FA);
  static const Color primaryDark = Color(0xFF2563EB);

  // アクセントカラー
  static const Color accent = Color(0xFF64B5F6);
  static const Color accentMint = Color(0xFF6EE7B7);

  // ステータスカラー - 気圧状態
  static const Color danger = Color(0xFFFCA5A5);
  static const Color dangerDark = Color(0xFFF06292);
  static const Color dangerText = Color(0xFFFB7185);
  static const Color caution = Color(0xFFFDE047);
  static const Color cautionOrange = Color(0xFFFFB74D);
  static const Color cautionText = Color(0xFFEAB308);
  static const Color stable = Color(0xFF93C5FD);
  static const Color stableLight = Color(0xFFBFDBFE);

  // 成功・アクティブ
  static const Color success = Color(0xFF4ADE80);
  static const Color successLight = Color(0xFF86EFAC);

  // 背景
  static const Color bgMain = Color(0xFFF8FAFC);
  static const Color bgSoft = Color(0xFFF1F5F9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceGlass = Color(0xD9FFFFFF); // 85% opacity

  // テキスト
  static const Color textMain = Color(0xFF334155);
  static const Color textDark = Color(0xFF1E293B);
  static const Color textSub = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color textLight = Color(0xFFCBD5E1);

  // 境界線・区切り
  static const Color divider = Color(0xFFF1F5F9);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderLight = Color(0xFFF1F5F9);

  // プレミアム
  static const Color premiumBg = Color(0xFFEEF4FF);

  // オーバーレイ
  static const Color overlay = Color(0x80000000);
  static const Color overlayLight = Color(0x4D000000);
}

/// 気圧状態
enum PressureStatus { danger, caution, stable }

/// 気圧状態に応じた色を返す
class PressureStatusColors {
  final Color bg;
  final Color text;
  final Color bgLight;

  const PressureStatusColors({
    required this.bg,
    required this.text,
    required this.bgLight,
  });

  static PressureStatusColors fromStatus(PressureStatus status) {
    switch (status) {
      case PressureStatus.danger:
        return const PressureStatusColors(
          bg: AppColors.danger,
          text: AppColors.dangerText,
          bgLight: Color(0x1AFCA5A5),
        );
      case PressureStatus.caution:
        return const PressureStatusColors(
          bg: AppColors.caution,
          text: AppColors.cautionOrange,
          bgLight: Color(0x1AFDE047),
        );
      case PressureStatus.stable:
        return const PressureStatusColors(
          bg: AppColors.stable,
          text: AppColors.primary,
          bgLight: Color(0x1A93C5FD),
        );
    }
  }
}

/// 体調レベル
enum SeverityLevel { none, mild, moderate, severe }

/// 体調レベルに応じた色を返す
class SeverityColors {
  final Color bg;
  final Color bgLight;
  final Color border;

  const SeverityColors({
    required this.bg,
    required this.bgLight,
    required this.border,
  });

  static SeverityColors fromLevel(SeverityLevel level) {
    switch (level) {
      case SeverityLevel.none:
        return const SeverityColors(
          bg: AppColors.stable,
          bgLight: Color(0x1A64B5F6),
          border: Color(0x3364B5F6),
        );
      case SeverityLevel.mild:
        return const SeverityColors(
          bg: AppColors.cautionOrange,
          bgLight: Color(0x1AFFB74D),
          border: Color(0x33FFB74D),
        );
      case SeverityLevel.moderate:
        return const SeverityColors(
          bg: AppColors.dangerDark,
          bgLight: Color(0x1AF06292),
          border: Color(0x33F06292),
        );
      case SeverityLevel.severe:
        return const SeverityColors(
          bg: AppColors.dangerDark,
          bgLight: Color(0x26F06292),
          border: Color(0x4DF06292),
        );
    }
  }
}
