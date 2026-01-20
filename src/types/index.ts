/**
 * Zutsu-Log 型定義
 */

// ユーザー
export interface User {
  id: string;
  email: string | null;
  prefecture: string;
  city: string;
  createdAt: string;
}

// 体調レベル
export type SeverityLevel = 0 | 1 | 2 | 3;

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  0: 'なし',
  1: '少し痛む',
  2: '痛い',
  3: 'かなり痛い',
};

export const SEVERITY_EMOJIS: Record<SeverityLevel, string> = {
  0: '😊',
  1: '😐',
  2: '😫',
  3: '🤮',
};

// 体調記録
export interface HealthLog {
  id: string;
  userId: string;
  createdAt: string;
  severity: SeverityLevel;
  pressureHpa: number | null;
  memo: string | null;
  locationPrefecture: string | null;
  locationCity: string | null;
}

// 気圧状態
export type PressureStatus = 'danger' | 'caution' | 'stable';

export const PRESSURE_STATUS_LABELS: Record<PressureStatus, string> = {
  danger: '警戒',
  caution: '注意',
  stable: '安定',
};

// 気象データ
export interface WeatherData {
  pressure: number;
  pressureChange: number; // 前回比（%）
  status: PressureStatus;
  forecast: PressureForecast[];
  updatedAt: string;
}

// 気圧予報
export interface PressureForecast {
  time: string;
  pressure: number;
  status: PressureStatus;
}

// 設定
export interface AppSettings {
  location: {
    prefecture: string;
    city: string;
  };
  notifications: {
    pressureAlert: boolean;
    cautionAlert: boolean;
    sensitivity: 'low' | 'normal' | 'high';
  };
  medication: {
    reminderEnabled: boolean;
    schedule: string[];
  };
}

// API レスポンス
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// キャッシュされた気象データ
export interface WeatherCache {
  id: string;
  prefecture: string;
  city: string;
  data: WeatherData;
  fetchedAt: string;
}
