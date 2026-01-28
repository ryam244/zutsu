/**
 * Zutsu-Log Cloud Functions
 * 気象データのプロキシ＋キャッシュ
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// OpenWeatherMap API設定
const OPENWEATHERMAP_API_KEY = functions.config().openweathermap?.apikey || process.env.OPENWEATHERMAP_API_KEY;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30分

// 都道府県・市区町村の座標マッピング（主要都市）
const LOCATION_COORDS: Record<string, { lat: number; lon: number }> = {
  '東京都_千代田区': { lat: 35.6895, lon: 139.6917 },
  '東京都_新宿区': { lat: 35.6938, lon: 139.7034 },
  '東京都_渋谷区': { lat: 35.6640, lon: 139.6982 },
  '大阪府_大阪市': { lat: 34.6937, lon: 135.5023 },
  '愛知県_名古屋市': { lat: 35.1815, lon: 136.9066 },
  '北海道_札幌市': { lat: 43.0621, lon: 141.3544 },
  '福岡県_福岡市': { lat: 33.5902, lon: 130.4017 },
  '宮城県_仙台市': { lat: 38.2682, lon: 140.8694 },
  '広島県_広島市': { lat: 34.3853, lon: 132.4553 },
  '神奈川県_横浜市': { lat: 35.4437, lon: 139.6380 },
};

// デフォルト座標（東京）
const DEFAULT_COORDS = { lat: 35.6895, lon: 139.6917 };

interface WeatherData {
  pressure: number;
  pressureChange: number;
  status: 'danger' | 'caution' | 'stable';
  forecast: Array<{
    time: string;
    pressure: number;
    status: 'danger' | 'caution' | 'stable';
  }>;
  updatedAt: string;
}

// 気圧の状態を判定
function getPressureStatus(pressureChange: number): 'danger' | 'caution' | 'stable' {
  if (pressureChange <= -2) return 'danger';
  if (pressureChange <= -1) return 'caution';
  return 'stable';
}

// OpenWeatherMap APIから気象データを取得
async function fetchWeatherFromAPI(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${OPENWEATHERMAP_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error: ${response.status}`);
  }

  const data = await response.json();

  // 現在の気圧
  const currentPressure = data.current?.pressure || 1013;

  // 1時間前の気圧（hourlyの最初のエントリ）
  const hourAgo = data.hourly?.[0]?.pressure || currentPressure;
  const pressureChange = ((currentPressure - hourAgo) / hourAgo) * 100;

  // 24時間予報を作成
  const forecast = (data.hourly || []).slice(0, 24).map((hour: any) => {
    const hourPressure = hour.pressure || 1013;
    const hourChange = ((hourPressure - currentPressure) / currentPressure) * 100;
    return {
      time: new Date(hour.dt * 1000).toISOString(),
      pressure: hourPressure,
      status: getPressureStatus(hourChange),
    };
  });

  return {
    pressure: currentPressure,
    pressureChange: Math.round(pressureChange * 100) / 100,
    status: getPressureStatus(pressureChange),
    forecast,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 気象データ取得 Cloud Function
 * キャッシュがあれば返し、なければAPIから取得してキャッシュ
 */
export const getWeather = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '認証が必要です');
    }

    const { prefecture, city } = data;

    if (!prefecture || !city) {
      throw new functions.https.HttpsError('invalid-argument', '地域情報が必要です');
    }

    const cacheId = `${prefecture}_${city}`;
    const cacheRef = db.collection('weather_cache').doc(cacheId);

    try {
      // キャッシュを確認
      const cacheDoc = await cacheRef.get();

      if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        const fetchedAt = cacheData?.fetchedAt?.toDate();
        const now = new Date();

        // キャッシュが有効期限内か確認
        if (fetchedAt && (now.getTime() - fetchedAt.getTime()) < CACHE_DURATION_MS) {
          return {
            data: cacheData?.data,
            fromCache: true,
          };
        }
      }

      // 座標を取得
      const coords = LOCATION_COORDS[cacheId] || DEFAULT_COORDS;

      // APIからデータを取得
      const weatherData = await fetchWeatherFromAPI(coords.lat, coords.lon);

      // キャッシュに保存
      await cacheRef.set({
        prefecture,
        city,
        data: weatherData,
        fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        data: weatherData,
        fromCache: false,
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw new functions.https.HttpsError('internal', '気象データの取得に失敗しました');
    }
  });
