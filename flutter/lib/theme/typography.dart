import 'package:flutter/material.dart';
import 'app_colors.dart';

/// フォントサイズ定数
class FontSizes {
  FontSizes._();

  /// 10px - ラベル、バッジ、キャプション
  static const double xs = 10;

  /// 12px - サブテキスト、補足
  static const double sm = 12;

  /// 13px - 小さめの本文
  static const double md = 13;

  /// 14px - 本文
  static const double base = 14;

  /// 15px - やや大きめの本文
  static const double normal = 15;

  /// 16px - 小見出し
  static const double lg = 16;

  /// 17px - ヘッダータイトル
  static const double title = 17;

  /// 18px - セクションタイトル
  static const double xl = 18;

  /// 24px - 大きな数値
  static const double xxl = 24;

  /// 30px - ヒーロー数値
  static const double xxxl = 30;
}

/// 行の高さ定数
class LineHeights {
  LineHeights._();

  /// タイト - 見出し用
  static const double tight = 1.2;

  /// 標準 - 短いテキスト用
  static const double normal = 1.4;

  /// ゆったり - 本文用
  static const double relaxed = 1.6;
}

/// 文字間隔定数
class LetterSpacings {
  LetterSpacings._();

  static const double tighter = -0.5;
  static const double tight = -0.25;
  static const double normal = 0;
  static const double wide = 0.5;
  static const double wider = 1;
  static const double widest = 2;
}

/// よく使うテキストスタイルのプリセット
class AppTextStyles {
  AppTextStyles._();

  /// ヘッダータイトル
  static const TextStyle headerTitle = TextStyle(
    fontSize: FontSizes.title,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacings.tight,
    color: AppColors.textDark,
  );

  /// セクションタイトル
  static const TextStyle sectionTitle = TextStyle(
    fontSize: FontSizes.lg,
    fontWeight: FontWeight.bold,
    height: LineHeights.tight,
    color: AppColors.textDark,
  );

  /// 大きな数値（気圧など）
  static const TextStyle heroNumber = TextStyle(
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeight.bold,
    height: LineHeights.tight,
    color: AppColors.textDark,
  );

  /// カード内の数値
  static const TextStyle cardNumber = TextStyle(
    fontSize: FontSizes.xxl,
    fontWeight: FontWeight.bold,
    color: AppColors.textDark,
  );

  /// 本文
  static const TextStyle body = TextStyle(
    fontSize: FontSizes.base,
    fontWeight: FontWeight.normal,
    height: LineHeights.relaxed,
    color: AppColors.textMain,
  );

  /// サブテキスト
  static const TextStyle subtext = TextStyle(
    fontSize: FontSizes.sm,
    fontWeight: FontWeight.normal,
    height: LineHeights.normal,
    color: AppColors.textSub,
  );

  /// ラベル
  static const TextStyle label = TextStyle(
    fontSize: FontSizes.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacings.wider,
    color: AppColors.textMuted,
  );

  /// バッジテキスト
  static const TextStyle badge = TextStyle(
    fontSize: FontSizes.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacings.wide,
  );

  /// ボタンテキスト
  static const TextStyle button = TextStyle(
    fontSize: FontSizes.md,
    fontWeight: FontWeight.bold,
  );

  /// タブナビラベル
  static const TextStyle tabLabel = TextStyle(
    fontSize: FontSizes.xs,
    fontWeight: FontWeight.bold,
  );

  /// プライマリカラーのテキスト
  static const TextStyle primaryText = TextStyle(
    fontSize: FontSizes.base,
    fontWeight: FontWeight.w500,
    color: AppColors.primary,
  );

  /// ミュートテキスト
  static const TextStyle mutedText = TextStyle(
    fontSize: FontSizes.sm,
    fontWeight: FontWeight.normal,
    color: AppColors.textMuted,
  );
}
