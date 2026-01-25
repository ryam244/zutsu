/**
 * 気象データサービス
 * Cloud Functions経由でキャッシュ付きデータを取得
 */

import type { WeatherData } from '@/types';

// Cloud Functions URL
const FUNCTIONS_URL = 'https://asia-northeast1-zutsu-e1cc9.cloudfunctions.net/getWeather';

// ローカルキャッシュ
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

const localCache: Map<string, CacheEntry> = new Map();
const LOCAL_CACHE_TTL = 5 * 60 * 1000; // 5分

// Cloud Functionを呼び出して気象データを取得（直接HTTP）
export const fetchWeatherData = async (
  prefecture: string,
  _city?: string
): Promise<WeatherData | null> => {
  const cacheKey = prefecture;

  // ローカルキャッシュチェック
  const cached = localCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < LOCAL_CACHE_TTL) {
    return cached.data;
  }

  try {
    console.log('Fetching weather for:', prefecture);

    const response = await fetch(FUNCTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { prefecture } }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const json = await response.json();
    console.log('Response:', JSON.stringify(json));

    const weatherData = json.result as WeatherData;

    // ローカルキャッシュに保存
    localCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  } catch (error: any) {
    console.error('Weather fetch error:', error);
    console.error('Error message:', error?.message);
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
