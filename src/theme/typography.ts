/**
 * Zutsu-Log タイポグラフィ
 * フォントファミリー、サイズ、ウェイトの定義
 * ハードコード禁止 - 必ずこのファイルから参照すること
 */

export const fontFamily = {
  // React Nativeではシステムフォントを使用
  // iOS: San Francisco, Android: Roboto がデフォルト
  // 日本語フォントは expo-google-fonts で追加可能
  sans: 'System',
  // カスタムフォント読み込み後に使用
  notoSansJP: 'NotoSansJP',
  inter: 'Inter',
} as const;

export const fontSize = {
  /** 10px - ラベル、バッジ、キャプション */
  xs: 10,
  /** 12px - サブテキスト、補足 */
  sm: 12,
  /** 13px - 小さめの本文 */
  md: 13,
  /** 14px - 本文 */
  base: 14,
  /** 15px - やや大きめの本文 */
  normal: 15,
  /** 16px - 小見出し */
  lg: 16,
  /** 17px - ヘッダータイトル */
  title: 17,
  /** 18px - セクションタイトル */
  xl: 18,
  /** 24px - 大きな数値 */
  '2xl': 24,
  /** 30px - ヒーロー数値 */
  '3xl': 30,
} as const;

export const fontWeight = {
  /** 通常 */
  normal: '400' as const,
  /** 中間 */
  medium: '500' as const,
  /** 半太字 */
  semibold: '600' as const,
  /** 太字 */
  bold: '700' as const,
} as const;

export const lineHeight = {
  /** タイト - 見出し用 */
  tight: 1.2,
  /** 標準 - 短いテキスト用 */
  normal: 1.4,
  /** ゆったり - 本文用 */
  relaxed: 1.6,
} as const;

export const letterSpacing = {
  /** タイト */
  tighter: -0.5,
  tight: -0.25,
  /** 標準 */
  normal: 0,
  /** 広め - ラベル用 */
  wide: 0.5,
  /** かなり広め - 大文字ラベル用 */
  wider: 1,
  /** 最も広い */
  widest: 2,
} as const;

// よく使うテキストスタイルのプリセット
export const textStyles = {
  // ヘッダータイトル
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  // セクションタイトル
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  // 大きな数値（気圧など）
  heroNumber: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  // カード内の数値
  cardNumber: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  // 本文
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
  },
  // サブテキスト
  subtext: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  // ラベル（大文字）
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
  // バッジテキスト
  badge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wide,
  },
  // ボタンテキスト
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  // タブナビラベル
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
} as const;

export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
