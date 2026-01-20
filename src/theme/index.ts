/**
 * Zutsu-Log テーマ
 * 全てのデザイントークンをエクスポート
 *
 * 使用例:
 * import { theme } from '@/theme';
 * const { colors, spacing, fontSize } = theme;
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { colors, getPressureStatusColor, getSeverityColor } from './colors';
import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
} from './typography';
import {
  spacing,
  borderRadius,
  shadows,
  layout,
  safeArea,
} from './spacing';

export const theme = {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  spacing,
  borderRadius,
  shadows,
  layout,
  safeArea,
  // ヘルパー関数
  getPressureStatusColor,
  getSeverityColor,
} as const;

export type Theme = typeof theme;
export default theme;
