/**
 * Zutsu-Log Cloud Functions (v2)
 * テスト用：最小限の関数
 */

import { onCall } from 'firebase-functions/v2/https';

export const getWeather = onCall(
  { region: 'asia-northeast1' },
  async (request) => {
    console.log('=== Function called! ===');

    const { prefecture } = request.data as { prefecture?: string };
    console.log('Prefecture:', prefecture);

    // ハードコードされたテストデータを返す
    return {
      pressure: 1013,
      pressureChange: 0,
      status: 'stable',
      forecast: [
        { time: '現在', pressure: 1013, status: 'stable' },
        { time: '03:00', pressure: 1012, status: 'stable' },
        { time: '06:00', pressure: 1011, status: 'stable' },
      ],
      updatedAt: new Date().toISOString(),
      fromCache: false,
      testMode: true,
    };
  }
);
