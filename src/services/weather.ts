/**
 * OpenWeatherMap API サービス
 * 気圧データの取得と変換
 */

import { getCoordinates } from '@/constants/locations';
import type { WeatherData, PressureForecast, PressureStatus } from '@/types';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// キャッシュ（メモリ内）
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30分

// 気圧変化率から状態を判定
const getPressureStatus = (changeRate: number): PressureStatus => {
  const absChange = Math.abs(changeRate);
  if (absChange >= 3) return 'danger'; // 3%以上の変化
  if (absChange >= 1.5) return 'caution'; // 1.5%以上の変化
  return 'stable';
};

// 気圧変化率を計算（前回比 %）
const calculateChangeRate = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// OpenWeatherMap APIからデータを取得
export const fetchWeatherData = async (
  prefecture: string,
  city?: string
): Promise<WeatherData | null> => {
  if (!API_KEY) {
    console.warn('OpenWeatherMap API key is not set');
    return null;
  }

  const cacheKey = `${prefecture}_${city || ''}`;

  // キャッシュチェック
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const coords = getCoordinates(prefecture);
  if (!coords) {
    console.error(`Coordinates not found for: ${prefecture}`);
    return null;
  }

  try {
    const url = `${BASE_URL}?lat=${coords.lat}&lon=${coords.lon}&exclude=minutely,daily,alerts&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // 現在の気圧
    const currentPressure = data.current?.pressure || 1013;

    // 1時間前の気圧（hourlyの最初のデータ）
    const previousPressure = data.hourly?.[1]?.pressure || currentPressure;

    // 変化率を計算
    const changeRate = calculateChangeRate(currentPressure, previousPressure);
    const status = getPressureStatus(changeRate);

    // 予報データを変換（24時間分）
    const forecast: PressureForecast[] = (data.hourly || [])
      .slice(0, 24)
      .map((hour: { dt: number; pressure: number }, index: number) => {
        const time = new Date(hour.dt * 1000);
        const timeStr =
          index === 0
            ? '現在'
            : `${time.getHours().toString().padStart(2, '0')}:00`;

        const hourPressure = hour.pressure;
        const prevHourPressure =
          index > 0 ? data.hourly[index - 1].pressure : hourPressure;
        const hourChangeRate = calculateChangeRate(hourPressure, prevHourPressure);

        return {
          time: timeStr,
          pressure: hourPressure,
          status: getPressureStatus(hourChangeRate),
        };
      });

    const weatherData: WeatherData = {
      pressure: currentPressure,
      pressureChange: Math.round(changeRate * 10) / 10,
      status,
      forecast,
      updatedAt: new Date().toISOString(),
    };

    // キャッシュに保存
    cache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  } catch (error) {
    console.error('Weather API error:', error);
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
