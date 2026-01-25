"use strict";
/**
 * Zutsu-Log Cloud Functions (v2)
 * 気象データ取得（OpenWeatherMap API + Firestoreキャッシュ）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// OpenWeatherMap API Key（環境変数から取得）
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
// キャッシュTTL（6時間）
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
// 都道府県の代表都市座標
const PREFECTURE_COORDS = {
    '北海道': { lat: 43.0621, lon: 141.3544, name: 'Sapporo' },
    '青森県': { lat: 40.8244, lon: 140.7400, name: 'Aomori' },
    '岩手県': { lat: 39.7036, lon: 141.1527, name: 'Morioka' },
    '宮城県': { lat: 38.2688, lon: 140.8721, name: 'Sendai' },
    '秋田県': { lat: 39.7186, lon: 140.1024, name: 'Akita' },
    '山形県': { lat: 38.2405, lon: 140.3633, name: 'Yamagata' },
    '福島県': { lat: 37.7500, lon: 140.4678, name: 'Fukushima' },
    '茨城県': { lat: 36.3417, lon: 140.4467, name: 'Mito' },
    '栃木県': { lat: 36.5657, lon: 139.8836, name: 'Utsunomiya' },
    '群馬県': { lat: 36.3906, lon: 139.0604, name: 'Maebashi' },
    '埼玉県': { lat: 35.8569, lon: 139.6489, name: 'Saitama' },
    '千葉県': { lat: 35.6050, lon: 140.1233, name: 'Chiba' },
    '東京都': { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
    '神奈川県': { lat: 35.4478, lon: 139.6425, name: 'Yokohama' },
    '新潟県': { lat: 37.9022, lon: 139.0236, name: 'Niigata' },
    '富山県': { lat: 36.6953, lon: 137.2114, name: 'Toyama' },
    '石川県': { lat: 36.5944, lon: 136.6256, name: 'Kanazawa' },
    '福井県': { lat: 36.0651, lon: 136.2216, name: 'Fukui' },
    '山梨県': { lat: 35.6642, lon: 138.5683, name: 'Kofu' },
    '長野県': { lat: 36.6513, lon: 138.1810, name: 'Nagano' },
    '岐阜県': { lat: 35.3912, lon: 136.7223, name: 'Gifu' },
    '静岡県': { lat: 34.9769, lon: 138.3831, name: 'Shizuoka' },
    '愛知県': { lat: 35.1802, lon: 136.9066, name: 'Nagoya' },
    '三重県': { lat: 34.7303, lon: 136.5086, name: 'Tsu' },
    '滋賀県': { lat: 35.0045, lon: 135.8685, name: 'Otsu' },
    '京都府': { lat: 35.0116, lon: 135.7681, name: 'Kyoto' },
    '大阪府': { lat: 34.6937, lon: 135.5023, name: 'Osaka' },
    '兵庫県': { lat: 34.6913, lon: 135.1830, name: 'Kobe' },
    '奈良県': { lat: 34.6851, lon: 135.8329, name: 'Nara' },
    '和歌山県': { lat: 34.2261, lon: 135.1675, name: 'Wakayama' },
    '鳥取県': { lat: 35.5039, lon: 134.2380, name: 'Tottori' },
    '島根県': { lat: 35.4724, lon: 133.0505, name: 'Matsue' },
    '岡山県': { lat: 34.6618, lon: 133.9344, name: 'Okayama' },
    '広島県': { lat: 34.3966, lon: 132.4596, name: 'Hiroshima' },
    '山口県': { lat: 34.1859, lon: 131.4714, name: 'Yamaguchi' },
    '徳島県': { lat: 34.0658, lon: 134.5593, name: 'Tokushima' },
    '香川県': { lat: 34.3401, lon: 134.0434, name: 'Takamatsu' },
    '愛媛県': { lat: 33.8417, lon: 132.7661, name: 'Matsuyama' },
    '高知県': { lat: 33.5597, lon: 133.5311, name: 'Kochi' },
    '福岡県': { lat: 33.5902, lon: 130.4017, name: 'Fukuoka' },
    '佐賀県': { lat: 33.2494, lon: 130.2988, name: 'Saga' },
    '長崎県': { lat: 32.7448, lon: 129.8737, name: 'Nagasaki' },
    '熊本県': { lat: 32.7898, lon: 130.7417, name: 'Kumamoto' },
    '大分県': { lat: 33.2382, lon: 131.6126, name: 'Oita' },
    '宮崎県': { lat: 31.9111, lon: 131.4239, name: 'Miyazaki' },
    '鹿児島県': { lat: 31.5602, lon: 130.5581, name: 'Kagoshima' },
    '沖縄県': { lat: 26.2124, lon: 127.6809, name: 'Naha' },
};
// 気圧状態を判定
const getPressureStatus = (current, change) => {
    // 急激な変化（3hPa以上の変化）
    if (Math.abs(change) >= 3)
        return 'danger';
    // 中程度の変化（1.5hPa以上の変化）
    if (Math.abs(change) >= 1.5)
        return 'caution';
    // 低気圧
    if (current < 1005)
        return 'danger';
    if (current < 1010)
        return 'caution';
    return 'stable';
};
// 時刻フォーマット
const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    return `${hours}:00`;
};
// OpenWeatherMap APIからデータを取得
const fetchWeatherFromAPI = async (lat, lon) => {
    if (!OPENWEATHER_API_KEY) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    // 現在の天気を取得
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const currentRes = await fetch(currentUrl);
    if (!currentRes.ok) {
        throw new https_1.HttpsError('unavailable', `Weather API error: ${currentRes.status}`);
    }
    const currentData = await currentRes.json();
    // 予報データを取得（3時間ごと、5日間）
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) {
        throw new https_1.HttpsError('unavailable', `Forecast API error: ${forecastRes.status}`);
    }
    const forecastData = await forecastRes.json();
    return { current: currentData, forecast: forecastData };
};
// Cloud Function: 気象データ取得
exports.getWeather = (0, https_1.onCall)({ region: 'asia-northeast1' }, async (request) => {
    var _a;
    const { prefecture } = request.data;
    if (!prefecture) {
        throw new https_1.HttpsError('invalid-argument', 'Prefecture is required');
    }
    const coords = PREFECTURE_COORDS[prefecture];
    if (!coords) {
        throw new https_1.HttpsError('invalid-argument', `Unknown prefecture: ${prefecture}`);
    }
    // Firestoreキャッシュを確認
    const cacheRef = db.collection('weather_cache').doc(prefecture);
    const cacheDoc = await cacheRef.get();
    if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        const cacheAge = Date.now() - ((_a = cacheData === null || cacheData === void 0 ? void 0 : cacheData.updatedAt) === null || _a === void 0 ? void 0 : _a.toMillis());
        if (cacheAge < CACHE_TTL_MS) {
            console.log(`Cache hit for ${prefecture}`);
            return Object.assign(Object.assign({}, cacheData === null || cacheData === void 0 ? void 0 : cacheData.weatherData), { fromCache: true });
        }
    }
    console.log(`Fetching fresh data for ${prefecture}`);
    // APIからデータを取得
    const { current, forecast } = await fetchWeatherFromAPI(coords.lat, coords.lon);
    // 現在の気圧
    const currentPressure = Math.round(current.main.pressure);
    // 3時間後の予報から気圧変化を計算
    const nextForecast = forecast.list[0];
    const nextPressure = Math.round(nextForecast.main.pressure);
    const pressureChange = nextPressure - currentPressure;
    // ステータスを判定
    const status = getPressureStatus(currentPressure, pressureChange);
    // 予報データを整形（9ポイント = 24時間分）
    const forecastPoints = forecast.list.slice(0, 9).map((item, index) => {
        const itemPressure = Math.round(item.main.pressure);
        const prevPressure = index > 0
            ? Math.round(forecast.list[index - 1].main.pressure)
            : currentPressure;
        const change = itemPressure - prevPressure;
        return {
            time: index === 0 ? '現在' : formatTime(item.dt),
            pressure: itemPressure,
            status: getPressureStatus(itemPressure, change),
        };
    });
    const weatherData = {
        pressure: currentPressure,
        pressureChange,
        status,
        forecast: forecastPoints,
        updatedAt: new Date().toISOString(),
        fromCache: false,
    };
    // Firestoreにキャッシュ保存
    await cacheRef.set({
        weatherData,
        updatedAt: new Date(),
        prefecture,
    });
    return weatherData;
});
//# sourceMappingURL=index.js.map