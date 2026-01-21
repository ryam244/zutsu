/**
 * Zutsu-Log Cloud Functions (v2)
 * 気象データのプロキシ + Firestoreキャッシュ
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();

const db = getFirestore();

// 環境変数からAPIキーを取得
const openweatherApiKey = defineString('OPENWEATHER_API_KEY');

// キャッシュ有効期限（6時間）
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// OpenWeatherMap API設定
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// 都道府県座標マッピング
const PREFECTURE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  '北海道': { lat: 43.0646, lon: 141.3468 },
  '青森県': { lat: 40.8244, lon: 140.74 },
  '岩手県': { lat: 39.7036, lon: 141.1527 },
  '宮城県': { lat: 38.2688, lon: 140.8721 },
  '秋田県': { lat: 39.7186, lon: 140.1024 },
  '山形県': { lat: 38.2404, lon: 140.3633 },
  '福島県': { lat: 37.75, lon: 140.4676 },
  '茨城県': { lat: 36.3418, lon: 140.4468 },
  '栃木県': { lat: 36.5657, lon: 139.8836 },
  '群馬県': { lat: 36.3912, lon: 139.0608 },
  '埼玉県': { lat: 35.8569, lon: 139.6489 },
  '千葉県': { lat: 35.6047, lon: 140.1233 },
  '東京都': { lat: 35.6895, lon: 139.6917 },
  '神奈川県': { lat: 35.4478, lon: 139.6425 },
  '新潟県': { lat: 37.9026, lon: 139.0236 },
  '富山県': { lat: 36.6953, lon: 137.2113 },
  '石川県': { lat: 36.5946, lon: 136.6256 },
  '福井県': { lat: 36.0652, lon: 136.2216 },
  '山梨県': { lat: 35.6642, lon: 138.5684 },
  '長野県': { lat: 36.6513, lon: 138.181 },
  '岐阜県': { lat: 35.3912, lon: 136.7223 },
  '静岡県': { lat: 34.9769, lon: 138.3831 },
  '愛知県': { lat: 35.1802, lon: 136.9066 },
  '三重県': { lat: 34.7303, lon: 136.5086 },
  '滋賀県': { lat: 35.0045, lon: 135.8686 },
  '京都府': { lat: 35.0116, lon: 135.7681 },
  '大阪府': { lat: 34.6937, lon: 135.5023 },
  '兵庫県': { lat: 34.6913, lon: 135.183 },
  '奈良県': { lat: 34.6851, lon: 135.8049 },
  '和歌山県': { lat: 34.226, lon: 135.1675 },
  '鳥取県': { lat: 35.5039, lon: 134.2377 },
  '島根県': { lat: 35.4723, lon: 133.0505 },
  '岡山県': { lat: 34.6618, lon: 133.9344 },
  '広島県': { lat: 34.3966, lon: 132.4596 },
  '山口県': { lat: 34.186, lon: 131.4714 },
  '徳島県': { lat: 34.0658, lon: 134.5593 },
  '香川県': { lat: 34.3401, lon: 134.0434 },
  '愛媛県': { lat: 33.8416, lon: 132.7657 },
  '高知県': { lat: 33.5597, lon: 133.531 },
  '福岡県': { lat: 33.6064, lon: 130.4183 },
  '佐賀県': { lat: 33.2494, lon: 130.2988 },
  '長崎県': { lat: 32.7448, lon: 129.8737 },
  '熊本県': { lat: 32.7898, lon: 130.7417 },
  '大分県': { lat: 33.2382, lon: 131.6126 },
  '宮崎県': { lat: 31.9111, lon: 131.4239 },
  '鹿児島県': { lat: 31.5602, lon: 130.5581 },
  '沖縄県': { lat: 26.2124, lon: 127.6809 },
};

// 気圧状態を判定
type PressureStatus = 'danger' | 'caution' | 'stable';

const getPressureStatus = (changeRate: number): PressureStatus => {
  const absChange = Math.abs(changeRate);
  if (absChange >= 3) return 'danger';
  if (absChange >= 1.5) return 'caution';
  return 'stable';
};

// 気圧変化率を計算
const calculateChangeRate = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// OpenWeatherMapからデータを取得
async function fetchFromOpenWeather(lat: number, lon: number, apiKey: string) {
  const url = `${OPENWEATHER_BASE_URL}?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error: ${response.status}`);
  }

  return response.json();
}

// 気象データを変換
function transformWeatherData(data: any) {
  const currentPressure = data.current?.pressure || 1013;
  const previousPressure = data.hourly?.[1]?.pressure || currentPressure;
  const changeRate = calculateChangeRate(currentPressure, previousPressure);
  const status = getPressureStatus(changeRate);

  const forecast = (data.hourly || []).slice(0, 24).map((hour: any, index: number) => {
    const time = new Date(hour.dt * 1000);
    const timeStr = index === 0 ? '現在' : `${time.getHours().toString().padStart(2, '0')}:00`;
    const hourPressure = hour.pressure;
    const prevHourPressure = index > 0 ? data.hourly[index - 1].pressure : hourPressure;
    const hourChangeRate = calculateChangeRate(hourPressure, prevHourPressure);

    return {
      time: timeStr,
      pressure: hourPressure,
      status: getPressureStatus(hourChangeRate),
    };
  });

  return {
    pressure: currentPressure,
    pressureChange: Math.round(changeRate * 10) / 10,
    status,
    forecast,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 気象データ取得 Cloud Function
 * Firestoreキャッシュを活用してAPIコールを最小化
 */
export const getWeather = onCall(
  { region: 'asia-northeast1' },
  async (request) => {
    // 認証チェック
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '認証が必要です');
    }

    const { prefecture } = request.data as { prefecture: string };
    if (!prefecture || !PREFECTURE_COORDINATES[prefecture]) {
      throw new HttpsError('invalid-argument', '無効な都道府県です');
    }

    const cacheId = prefecture;
    const cacheRef = db.collection('weather_cache').doc(cacheId);

    try {
      // キャッシュをチェック
      const cacheDoc = await cacheRef.get();

      if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        const fetchedAt = cacheData?.fetchedAt?.toDate();
        const now = new Date();

        // キャッシュが有効な場合はそれを返す
        if (fetchedAt && (now.getTime() - fetchedAt.getTime()) < CACHE_TTL_MS) {
          console.log(`Cache hit for ${prefecture}`);
          return {
            ...cacheData?.data,
            fromCache: true,
            cacheAge: Math.round((now.getTime() - fetchedAt.getTime()) / 1000 / 60),
          };
        }
      }

      // APIキーを取得
      const apiKey = openweatherApiKey.value();
      if (!apiKey) {
        throw new HttpsError('failed-precondition', 'API key not configured');
      }

      // OpenWeatherMapから取得
      console.log(`Fetching from OpenWeatherMap for ${prefecture}`);
      const coords = PREFECTURE_COORDINATES[prefecture];
      const rawData = await fetchFromOpenWeather(coords.lat, coords.lon, apiKey);
      const weatherData = transformWeatherData(rawData);

      // キャッシュに保存
      await cacheRef.set({
        prefecture,
        data: weatherData,
        fetchedAt: FieldValue.serverTimestamp(),
      });

      return {
        ...weatherData,
        fromCache: false,
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw new HttpsError('internal', '気象データの取得に失敗しました');
    }
  }
);
