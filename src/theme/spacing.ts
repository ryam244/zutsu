/**
 * Zutsu-Log スペーシング・レイアウト
 * 間隔、角丸、シャドウの定義
 * ハードコード禁止 - 必ずこのファイルから参照すること
 */

export const spacing = {
  /** 2px */
  '2xs': 2,
  /** 4px */
  xs: 4,
  /** 6px */
  sm: 6,
  /** 8px */
  md: 8,
  /** 12px */
  lg: 12,
  /** 16px */
  xl: 16,
  /** 20px */
  '2xl': 20,
  /** 24px */
  '3xl': 24,
  /** 32px */
  '4xl': 32,
  /** 40px */
  '5xl': 40,
  /** 48px */
  '6xl': 48,
} as const;

export const borderRadius = {
  /** 4px - 小さなバッジ */
  sm: 4,
  /** 8px - ボタン、入力フィールド */
  md: 8,
  /** 12px - カード（iOS風） */
  lg: 12,
  /** 16px - 大きなカード */
  xl: 16,
  /** 20px - パネル */
  '2xl': 20,
  /** 24px - モーダル */
  '3xl': 24,
  /** 完全な円 */
  full: 9999,
} as const;

// iOS風のシャドウ（React Native用）
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  // プライマリカラーのシャドウ（ボタン用）
  primarySm: {
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryLg: {
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// よく使うレイアウト値
export const layout = {
  // 画面のパディング
  screenPaddingX: spacing.xl,    // 16px
  screenPaddingY: spacing['2xl'], // 20px

  // カードのパディング
  cardPaddingX: spacing['2xl'],  // 20px
  cardPaddingY: spacing.xl,      // 16px

  // ヘッダーの高さ
  headerHeight: 56,

  // ボトムナビの高さ
  bottomNavHeight: 60,
  bottomNavHeightWithSafe: 80,

  // FABのサイズ
  fabSize: 56,

  // アイコンサイズ
  iconSm: 18,
  iconMd: 22,
  iconLg: 26,
  iconXl: 30,

  // アバター・サムネイル
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 48,

  // タイムラインのアイコン
  timelineIconSize: 40,

  // トグルスイッチ
  toggleWidth: 44,
  toggleHeight: 24,
  toggleThumb: 20,
} as const;

// 安全領域（Safe Area）
export const safeArea = {
  // iOS のノッチ対応
  top: 44,
  bottom: 34,
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
