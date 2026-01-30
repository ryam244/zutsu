import 'dart:math' as math;
import 'package:zutsu_log/theme/app_colors.dart';

/// 気象データ
class WeatherData {
  final double pressure;
  final double pressureChange;
  final PressureStatus status;
  final List<PressureForecast> forecast;
  final DateTime updatedAt;

  const WeatherData({
    required this.pressure,
    required this.pressureChange,
    required this.status,
    required this.forecast,
    required this.updatedAt,
  });

  factory WeatherData.fromJson(Map<String, dynamic> json) {
    return WeatherData(
      pressure: (json['pressure'] as num).toDouble(),
      pressureChange: (json['pressureChange'] as num).toDouble(),
      status: _parseStatus(json['status'] as String),
      forecast: (json['forecast'] as List<dynamic>)
          .map((e) => PressureForecast.fromJson(e as Map<String, dynamic>))
          .toList(),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pressure': pressure,
      'pressureChange': pressureChange,
      'status': status.name,
      'forecast': forecast.map((e) => e.toJson()).toList(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  static PressureStatus _parseStatus(String status) {
    switch (status) {
      case 'danger':
        return PressureStatus.danger;
      case 'caution':
        return PressureStatus.caution;
      default:
        return PressureStatus.stable;
    }
  }

  /// フォールバック用のモックデータ
  factory WeatherData.fallback() {
    final now = DateTime.now();
    final forecast = List.generate(24, (i) {
      final time = now.add(Duration(hours: i));
      final basePressure = 1013.0;
      final variation = math.sin(i / 6) * 5;
      final pressure = basePressure + variation;
      return PressureForecast(
        time: time,
        pressure: pressure,
        status: PressureStatus.stable,
      );
    });

    return WeatherData(
      pressure: 1013,
      pressureChange: -0.5,
      status: PressureStatus.stable,
      forecast: forecast,
      updatedAt: now,
    );
  }
}

/// 気圧予報
class PressureForecast {
  final DateTime time;
  final double pressure;
  final PressureStatus status;

  const PressureForecast({
    required this.time,
    required this.pressure,
    required this.status,
  });

  factory PressureForecast.fromJson(Map<String, dynamic> json) {
    return PressureForecast(
      time: DateTime.parse(json['time'] as String),
      pressure: (json['pressure'] as num).toDouble(),
      status: WeatherData._parseStatus(json['status'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'time': time.toIso8601String(),
      'pressure': pressure,
      'status': status.name,
    };
  }
}

/// 状態に応じたメッセージ
class StatusMessage {
  final String forecast;
  final String advice;
  final String risk;
  final String changeLabel;
  final String icon;

  const StatusMessage({
    required this.forecast,
    required this.advice,
    required this.risk,
    required this.changeLabel,
    required this.icon,
  });

  static StatusMessage fromStatus(PressureStatus status) {
    switch (status) {
      case PressureStatus.danger:
        return const StatusMessage(
          forecast: '気圧が急低下しています',
          advice: '大幅な気圧の変化が予想されます。早めの休息を心がけてください。',
          risk: '高',
          changeLabel: '急降下中',
          icon: '📉',
        );
      case PressureStatus.caution:
        return const StatusMessage(
          forecast: '気圧がやや低下しています',
          advice: '気圧の変化に注意してください。無理をしないようにしましょう。',
          risk: '中',
          changeLabel: '低下中',
          icon: '📉',
        );
      case PressureStatus.stable:
        return const StatusMessage(
          forecast: '気圧は安定しています',
          advice: '現在の気圧は安定しています。快適にお過ごしください。',
          risk: '低',
          changeLabel: '安定',
          icon: '📊',
        );
    }
  }
}
