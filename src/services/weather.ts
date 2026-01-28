/**
 * 気象データサービス
 * Cloud Functions経由でOpenWeatherMap APIからデータを取得
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import app from './firebase';
import type { WeatherData } from '@/types';

// Cloud Functions インスタンス（東京リージョン）
const functions = getFunctions(app, 'asia-northeast1');

// 開発時はエミュレータに接続（必要に応じてコメントアウト）
// connectFunctionsEmulator(functions, 'localhost', 5001);

// Cloud Function の参照
const getWeatherFunction = httpsCallable<
  { prefecture: string; city: string },
  { data: WeatherData; fromCache: boolean }
>(functions, 'getWeather');

/**
 * 気象データを取得
 * Cloud Functions経由でキャッシュ付きで取得
 */
export async function fetchWeatherData(
  prefecture: string,
  city: string
): Promise<WeatherData> {
  try {
    const result = await getWeatherFunction({ prefecture, city });
    return result.data.data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    // エラー時はフォールバックデータを返す
    return getFallbackWeatherData();
  }
}

/**
 * フォールバック用のモックデータ
 * API取得失敗時に使用
 */
function getFallbackWeatherData(): WeatherData {
  const now = new Date();
  const forecast = [];

  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    // ランダムな気圧変動をシミュレート
    const basePressure = 1013;
    const variation = Math.sin(i / 6) * 5;
    const pressure = Math.round(basePressure + variation);

    forecast.push({
      time: time.toISOString(),
      pressure,
      status: getStatusFromPressure(pressure, basePressure) as 'danger' | 'caution' | 'stable',
    });
  }

  return {
    pressure: 1013,
    pressureChange: -0.5,
    status: 'stable',
    forecast,
    updatedAt: now.toISOString(),
  };
}

/**
 * 気圧から状態を判定
 */
function getStatusFromPressure(
  current: number,
  baseline: number
): 'danger' | 'caution' | 'stable' {
  const change = ((current - baseline) / baseline) * 100;
  if (change <= -0.5) return 'danger';
  if (change <= -0.2) return 'caution';
  return 'stable';
}

/**
 * 気圧変化から状態を判定（エクスポート用）
 */
export function getPressureStatus(
  pressureChange: number
): 'danger' | 'caution' | 'stable' {
  if (pressureChange <= -2) return 'danger';
  if (pressureChange <= -1) return 'caution';
  return 'stable';
}
