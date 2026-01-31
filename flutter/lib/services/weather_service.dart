import 'package:flutter/foundation.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:zutsu_log/models/weather_data.dart';

/// 気象データサービス
/// Cloud Functions経由でOpenWeatherMap APIからデータを取得
class WeatherService {
  static final FirebaseFunctions _functions =
      FirebaseFunctions.instanceFor(region: 'asia-northeast1');

  /// 気象データを取得
  static Future<WeatherData> fetchWeatherData(
    String prefecture,
    String city,
  ) async {
    try {
      final callable = _functions.httpsCallable('getWeather');
      final result = await callable.call<Map<String, dynamic>>({
        'prefecture': prefecture,
        'city': city,
      });

      final data = result.data['data'] as Map<String, dynamic>;
      return WeatherData.fromJson(data);
    } catch (e) {
      debugPrint('Weather fetch error: $e');
      // エラー時はフォールバックデータを返す
      return WeatherData.fallback();
    }
  }
}
