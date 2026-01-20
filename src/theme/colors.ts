/**
 * Zutsu-Log カラーパレット
 * デザインデータから抽出した色定義
 * ハードコード禁止 - 必ずこのファイルから参照すること
 */

export const colors = {
  // プライマリカラー
  primary: '#4A90E2',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',

  // アクセントカラー
  accent: '#64B5F6',
  accentMint: '#6ee7b7',

  // ステータスカラー - 気圧状態
  danger: '#fca5a5',        // 警戒（気圧急降下）- 薄い赤
  dangerDark: '#F06292',    // 重度 - ピンク
  dangerText: '#fb7185',    // 警戒テキスト
  caution: '#fde047',       // 注意 - イエロー
  cautionOrange: '#FFB74D', // 中度 - オレンジ
  stable: '#93c5fd',        // 安定 - ライトブルー
  stableLight: '#bfdbfe',   // 安定（薄い）

  // 成功・アクティブ
  success: '#4ADE80',       // トグルON、成功
  successLight: '#86efac',

  // 背景
  bgMain: '#F8FAFC',        // メイン背景
  bgSoft: '#f1f5f9',        // セカンダリ背景
  surface: '#FFFFFF',       // カード・パネル背景
  surfaceGlass: 'rgba(255, 255, 255, 0.85)', // ガラスモーフィズム

  // テキスト
  textMain: '#334155',      // メインテキスト（slate-700）
  textDark: '#1e293b',      // ダークテキスト（slate-800）
  textSub: '#64748B',       // サブテキスト（slate-500）
  textMuted: '#94A3B8',     // ミュートテキスト（slate-400）
  textLight: '#cbd5e1',     // ライトテキスト（slate-300）

  // 境界線・区切り
  divider: '#F1F5F9',       // 区切り線（slate-100）
  border: '#e2e8f0',        // ボーダー（slate-200）
  borderLight: '#f1f5f9',   // 薄いボーダー

  // プレミアム
  premiumBg: '#EEF4FF',     // プレミアムバナー背景

  // タイムライン・履歴用
  timelineLow: '#64B5F6',   // 軽度
  timelineModerate: '#FFB74D', // 中度
  timelineSevere: '#F06292',   // 重度

  // オーバーレイ
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

// 気圧状態に応じた色を返すヘルパー
export type PressureStatus = 'danger' | 'caution' | 'stable';

export const getPressureStatusColor = (status: PressureStatus) => {
  switch (status) {
    case 'danger':
      return {
        bg: colors.danger,
        text: colors.dangerText,
        bgLight: 'rgba(252, 165, 165, 0.1)',
      };
    case 'caution':
      return {
        bg: colors.caution,
        text: colors.cautionOrange,
        bgLight: 'rgba(253, 224, 71, 0.1)',
      };
    case 'stable':
      return {
        bg: colors.stable,
        text: colors.primary,
        bgLight: 'rgba(147, 197, 253, 0.1)',
      };
  }
};

// 体調レベルに応じた色を返すヘルパー
export type SeverityLevel = 0 | 1 | 2 | 3;

export const getSeverityColor = (level: SeverityLevel) => {
  switch (level) {
    case 0: // なし
      return {
        bg: colors.stable,
        bgLight: 'rgba(100, 181, 246, 0.1)',
        border: 'rgba(100, 181, 246, 0.2)',
      };
    case 1: // 少し痛む
      return {
        bg: colors.cautionOrange,
        bgLight: 'rgba(255, 183, 77, 0.1)',
        border: 'rgba(255, 183, 77, 0.2)',
      };
    case 2: // 痛い
      return {
        bg: colors.dangerDark,
        bgLight: 'rgba(240, 98, 146, 0.1)',
        border: 'rgba(240, 98, 146, 0.2)',
      };
    case 3: // かなり痛い
      return {
        bg: colors.dangerDark,
        bgLight: 'rgba(240, 98, 146, 0.15)',
        border: 'rgba(240, 98, 146, 0.3)',
      };
  }
};

export type Colors = typeof colors;
