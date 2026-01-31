import 'package:flutter/material.dart';

/// スペーシング定数
class Spacing {
  Spacing._();

  /// 2px
  static const double xxs = 2;

  /// 4px
  static const double xs = 4;

  /// 6px
  static const double sm = 6;

  /// 8px
  static const double md = 8;

  /// 12px
  static const double lg = 12;

  /// 16px
  static const double xl = 16;

  /// 20px
  static const double xxl = 20;

  /// 24px
  static const double xxxl = 24;

  /// 32px
  static const double xxxxl = 32;

  /// 40px
  static const double xxxxxl = 40;

  /// 48px
  static const double xxxxxxl = 48;
}

/// 角丸定数
class AppRadius {
  AppRadius._();

  /// 4px - 小さなバッジ
  static const double sm = 4;

  /// 8px - ボタン、入力フィールド
  static const double md = 8;

  /// 12px - カード（iOS風）
  static const double lg = 12;

  /// 16px - 大きなカード
  static const double xl = 16;

  /// 20px - パネル
  static const double xxl = 20;

  /// 24px - モーダル
  static const double xxxl = 24;

  /// BorderRadius
  static BorderRadius get smBorder => BorderRadius.circular(sm);
  static BorderRadius get mdBorder => BorderRadius.circular(md);
  static BorderRadius get lgBorder => BorderRadius.circular(lg);
  static BorderRadius get xlBorder => BorderRadius.circular(xl);
  static BorderRadius get xxlBorder => BorderRadius.circular(xxl);
  static BorderRadius get xxxlBorder => BorderRadius.circular(xxxl);
}

/// シャドウ定数
class AppShadows {
  AppShadows._();

  static List<BoxShadow> get none => [];

  static List<BoxShadow> get sm => [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          offset: const Offset(0, 1),
          blurRadius: 2,
        ),
      ];

  static List<BoxShadow> get md => [
        BoxShadow(
          color: Colors.black.withOpacity(0.08),
          offset: const Offset(0, 2),
          blurRadius: 4,
        ),
      ];

  static List<BoxShadow> get lg => [
        BoxShadow(
          color: Colors.black.withOpacity(0.1),
          offset: const Offset(0, 4),
          blurRadius: 8,
        ),
      ];

  static List<BoxShadow> get xl => [
        BoxShadow(
          color: Colors.black.withOpacity(0.12),
          offset: const Offset(0, 8),
          blurRadius: 16,
        ),
      ];

  /// プライマリカラーのシャドウ（ボタン用）
  static List<BoxShadow> get primarySm => [
        BoxShadow(
          color: const Color(0xFF4A90E2).withOpacity(0.2),
          offset: const Offset(0, 2),
          blurRadius: 4,
        ),
      ];

  static List<BoxShadow> get primaryLg => [
        BoxShadow(
          color: const Color(0xFF4A90E2).withOpacity(0.3),
          offset: const Offset(0, 4),
          blurRadius: 8,
        ),
      ];
}

/// レイアウト定数
class Layout {
  Layout._();

  /// 画面のパディング
  static const double screenPaddingX = Spacing.xl; // 16px
  static const double screenPaddingY = Spacing.xxl; // 20px

  /// カードのパディング
  static const double cardPaddingX = Spacing.xxl; // 20px
  static const double cardPaddingY = Spacing.xl; // 16px

  /// ヘッダーの高さ
  static const double headerHeight = 56;

  /// ボトムナビの高さ
  static const double bottomNavHeight = 60;
  static const double bottomNavHeightWithSafe = 80;

  /// FABのサイズ
  static const double fabSize = 56;

  /// アイコンサイズ
  static const double iconSm = 18;
  static const double iconMd = 22;
  static const double iconLg = 26;
  static const double iconXl = 30;

  /// アバター・サムネイル
  static const double avatarSm = 32;
  static const double avatarMd = 40;
  static const double avatarLg = 48;

  /// タイムラインのアイコン
  static const double timelineIconSize = 40;

  /// トグルスイッチ
  static const double toggleWidth = 44;
  static const double toggleHeight = 24;
  static const double toggleThumb = 20;

  /// EdgeInsets ヘルパー
  static EdgeInsets get screenPadding =>
      const EdgeInsets.symmetric(horizontal: screenPaddingX, vertical: screenPaddingY);

  static EdgeInsets get cardPadding =>
      const EdgeInsets.symmetric(horizontal: cardPaddingX, vertical: cardPaddingY);
}
