/**
 * 気象データサービス
 * Cloud Functions経由でキャッシュ付きデータを取得
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import app from './firebase';
import type { WeatherData } from '@/types';

// Functions インスタンス（asia-northeast1 リージョン）
const functions = getFunctions(app, 'asia-northeast1');

// 開発環境ではエミュレータに接続（必要な場合）
// connectFunctionsEmulator(functions, 'localhost', 5001);

// ローカルキャッシュ（Cloud Functionsのキャッシュに加えて、アプリ内でも短時間キャッシュ）
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

const localCache: Map<string, CacheEntry> = new Map();
const LOCAL_CACHE_TTL = 5 * 60 * 1000; // 5分（Cloud Functions側は6時間）

// Cloud Functionを呼び出して気象データを取得
export const fetchWeatherData = async (
  prefecture: string,
  _city?: string
): Promise<WeatherData | null> => {
  const cacheKey = prefecture;

  // ローカルキャッシュチェック（頻繁なAPI呼び出しを防ぐ）
  const cached = localCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < LOCAL_CACHE_TTL) {
    return cached.data;
  }

  try {
    const getWeather = httpsCallable<{ prefecture: string }, WeatherData & { fromCache?: boolean }>(
      functions,
      'getWeather'
    );

    const result = await getWeather({ prefecture });
    const weatherData = result.data;

    // ローカルキャッシュに保存
    localCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
};

// 気圧アラートメッセージを生成
export const generateAlertMessage = (weather: WeatherData): string => {
  const { status, pressureChange, forecast } = weather;

  // 今後6時間以内に危険な変化があるかチェック
  const dangerForecast = forecast.slice(0, 6).find((f) => f.status === 'danger');

  if (status === 'danger') {
    return pressureChange < 0
      ? '気圧が急激に低下しています。頭痛に注意してください。'
      : '気圧が急激に上昇しています。体調の変化に注意してください。';
  }

  if (dangerForecast) {
    const hours = forecast.indexOf(dangerForecast);
    return `${hours}時間後に気圧が急変する予報です。早めの対策をお勧めします。`;
  }

  if (status === 'caution') {
    return '気圧が変動しています。体調の変化に注意してください。';
  }

  return '気圧は安定しています。良い一日をお過ごしください。';
};

// 気圧アドバイスを生成
export const generateAdvice = (weather: WeatherData): string => {
  const { status, pressureChange } = weather;

  if (status === 'danger') {
    if (pressureChange < 0) {
      return '大幅な気圧の低下が予想されます。早めの休息を心がけてください。リスク：高';
    }
    return '大幅な気圧の上昇が予想されます。水分補給を忘れずに。リスク：高';
  }

  if (status === 'caution') {
    return '気圧の変動が続いています。無理のない範囲で活動してください。リスク：中';
  }

  return '気圧は安定しています。通常通りの活動が可能です。リスク：低';
};
