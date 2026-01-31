import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:zutsu_log/models/user.dart';
import 'package:zutsu_log/models/app_settings.dart';
import 'package:zutsu_log/models/health_log.dart';
import 'package:zutsu_log/models/weather_data.dart';

/// SharedPreferences プロバイダー
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main');
});

/// ストレージキー
class StorageKeys {
  static const String user = 'zutsu_user';
  static const String settings = 'zutsu_settings';
  static const String healthLogs = 'zutsu_health_logs';
}

/// ユーザープロバイダー
final userProvider = StateNotifierProvider<UserNotifier, User?>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return UserNotifier(prefs);
});

class UserNotifier extends StateNotifier<User?> {
  final SharedPreferences _prefs;

  UserNotifier(this._prefs) : super(null) {
    _load();
  }

  void _load() {
    try {
      final json = _prefs.getString(StorageKeys.user);
      if (json != null) {
        state = User.fromJson(jsonDecode(json) as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('Failed to load user: $e');
    }
  }

  Future<void> setUser(User? user) async {
    state = user;
    if (user != null) {
      await _prefs.setString(StorageKeys.user, jsonEncode(user.toJson()));
    } else {
      await _prefs.remove(StorageKeys.user);
    }
  }

  Future<void> updateLocation(String prefecture, String city) async {
    if (state != null) {
      final updated = state!.copyWith(prefecture: prefecture, city: city);
      await setUser(updated);
    }
  }
}

/// 設定プロバイダー
final settingsProvider =
    StateNotifierProvider<SettingsNotifier, AppSettings>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return SettingsNotifier(prefs);
});

class SettingsNotifier extends StateNotifier<AppSettings> {
  final SharedPreferences _prefs;

  SettingsNotifier(this._prefs) : super(AppSettings.defaults()) {
    _load();
  }

  void _load() {
    try {
      final json = _prefs.getString(StorageKeys.settings);
      if (json != null) {
        state = AppSettings.fromJson(jsonDecode(json) as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('Failed to load settings: $e');
    }
  }

  Future<void> _save() async {
    await _prefs.setString(StorageKeys.settings, jsonEncode(state.toJson()));
  }

  Future<void> updateLocation(LocationSettings location) async {
    state = state.copyWith(location: location);
    await _save();
  }

  Future<void> updateNotifications(NotificationSettings notifications) async {
    state = state.copyWith(notifications: notifications);
    await _save();
  }

  Future<void> updateMedication(MedicationSettings medication) async {
    state = state.copyWith(medication: medication);
    await _save();
  }

  Future<void> setPressureAlert(bool value) async {
    state = state.copyWith(
      notifications: state.notifications.copyWith(pressureAlert: value),
    );
    await _save();
  }

  Future<void> setCautionAlert(bool value) async {
    state = state.copyWith(
      notifications: state.notifications.copyWith(cautionAlert: value),
    );
    await _save();
  }

  Future<void> setSensitivity(Sensitivity value) async {
    state = state.copyWith(
      notifications: state.notifications.copyWith(sensitivity: value),
    );
    await _save();
  }

  Future<void> setMedicationReminder(bool value) async {
    state = state.copyWith(
      medication: state.medication.copyWith(reminderEnabled: value),
    );
    await _save();
  }

  Future<void> setMedicationSchedule(List<String> schedule) async {
    state = state.copyWith(
      medication: state.medication.copyWith(schedule: schedule),
    );
    await _save();
  }
}

/// 気象データプロバイダー
final weatherProvider =
    StateNotifierProvider<WeatherNotifier, AsyncValue<WeatherData?>>((ref) {
  return WeatherNotifier();
});

class WeatherNotifier extends StateNotifier<AsyncValue<WeatherData?>> {
  WeatherNotifier() : super(const AsyncValue.data(null));

  void setLoading() {
    state = const AsyncValue.loading();
  }

  void setData(WeatherData? data) {
    state = AsyncValue.data(data);
  }

  void setError(Object error, StackTrace stackTrace) {
    state = AsyncValue.error(error, stackTrace);
  }
}

/// 体調記録プロバイダー
final healthLogsProvider =
    StateNotifierProvider<HealthLogsNotifier, List<HealthLog>>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return HealthLogsNotifier(prefs);
});

class HealthLogsNotifier extends StateNotifier<List<HealthLog>> {
  final SharedPreferences _prefs;

  HealthLogsNotifier(this._prefs) : super([]) {
    _load();
  }

  void _load() {
    try {
      final json = _prefs.getString(StorageKeys.healthLogs);
      if (json != null) {
        final list = jsonDecode(json) as List<dynamic>;
        state = list
            .map((e) => _healthLogFromJson(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      debugPrint('Failed to load health logs: $e');
    }
  }

  Future<void> _save() async {
    final list = state.map((e) => _healthLogToJson(e)).toList();
    await _prefs.setString(StorageKeys.healthLogs, jsonEncode(list));
  }

  Future<void> addLog(HealthLog log) async {
    state = [log, ...state];
    await _save();
  }

  Future<void> setLogs(List<HealthLog> logs) async {
    state = logs;
    await _save();
  }

  Future<void> removeLog(String id) async {
    state = state.where((log) => log.id != id).toList();
    await _save();
  }

  HealthLog _healthLogFromJson(Map<String, dynamic> json) {
    return HealthLog(
      id: json['id'] as String?,
      userId: json['userId'] as String? ?? '',
      severity: SeverityLevel.values[json['severity'] as int? ?? 0],
      pressureHpa: (json['pressureHpa'] as num?)?.toDouble(),
      memo: json['memo'] as String?,
      locationPrefecture: json['locationPrefecture'] as String?,
      locationCity: json['locationCity'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> _healthLogToJson(HealthLog log) {
    return {
      'id': log.id,
      'userId': log.userId,
      'severity': log.severity.index,
      'pressureHpa': log.pressureHpa,
      'memo': log.memo,
      'locationPrefecture': log.locationPrefecture,
      'locationCity': log.locationCity,
      'createdAt': log.createdAt.toIso8601String(),
    };
  }
}

/// UI状態プロバイダー
final isRecordingProvider = StateProvider<bool>((ref) => false);

/// 地域設定の簡易セレクター
final locationProvider = Provider<LocationSettings>((ref) {
  return ref.watch(settingsProvider).location;
});
