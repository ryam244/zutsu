/// アプリ設定モデル
class AppSettings {
  final LocationSettings location;
  final NotificationSettings notifications;
  final MedicationSettings medication;

  const AppSettings({
    required this.location,
    required this.notifications,
    required this.medication,
  });

  factory AppSettings.defaults() {
    return const AppSettings(
      location: LocationSettings(
        prefecture: '東京都',
        city: '千代田区',
      ),
      notifications: NotificationSettings(
        pressureAlert: true,
        cautionAlert: false,
        sensitivity: Sensitivity.normal,
      ),
      medication: MedicationSettings(
        reminderEnabled: false,
        schedule: ['08:00', '20:00'],
      ),
    );
  }

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      location: LocationSettings.fromJson(
        json['location'] as Map<String, dynamic>? ?? {},
      ),
      notifications: NotificationSettings.fromJson(
        json['notifications'] as Map<String, dynamic>? ?? {},
      ),
      medication: MedicationSettings.fromJson(
        json['medication'] as Map<String, dynamic>? ?? {},
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'location': location.toJson(),
      'notifications': notifications.toJson(),
      'medication': medication.toJson(),
    };
  }

  AppSettings copyWith({
    LocationSettings? location,
    NotificationSettings? notifications,
    MedicationSettings? medication,
  }) {
    return AppSettings(
      location: location ?? this.location,
      notifications: notifications ?? this.notifications,
      medication: medication ?? this.medication,
    );
  }
}

/// 地域設定
class LocationSettings {
  final String prefecture;
  final String city;

  const LocationSettings({
    required this.prefecture,
    required this.city,
  });

  factory LocationSettings.fromJson(Map<String, dynamic> json) {
    return LocationSettings(
      prefecture: json['prefecture'] as String? ?? '東京都',
      city: json['city'] as String? ?? '千代田区',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'prefecture': prefecture,
      'city': city,
    };
  }

  LocationSettings copyWith({
    String? prefecture,
    String? city,
  }) {
    return LocationSettings(
      prefecture: prefecture ?? this.prefecture,
      city: city ?? this.city,
    );
  }
}

/// 通知設定
class NotificationSettings {
  final bool pressureAlert;
  final bool cautionAlert;
  final Sensitivity sensitivity;

  const NotificationSettings({
    required this.pressureAlert,
    required this.cautionAlert,
    required this.sensitivity,
  });

  factory NotificationSettings.fromJson(Map<String, dynamic> json) {
    return NotificationSettings(
      pressureAlert: json['pressureAlert'] as bool? ?? true,
      cautionAlert: json['cautionAlert'] as bool? ?? false,
      sensitivity: Sensitivity.fromString(json['sensitivity'] as String?),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pressureAlert': pressureAlert,
      'cautionAlert': cautionAlert,
      'sensitivity': sensitivity.name,
    };
  }

  NotificationSettings copyWith({
    bool? pressureAlert,
    bool? cautionAlert,
    Sensitivity? sensitivity,
  }) {
    return NotificationSettings(
      pressureAlert: pressureAlert ?? this.pressureAlert,
      cautionAlert: cautionAlert ?? this.cautionAlert,
      sensitivity: sensitivity ?? this.sensitivity,
    );
  }
}

/// 服薬設定
class MedicationSettings {
  final bool reminderEnabled;
  final List<String> schedule;

  const MedicationSettings({
    required this.reminderEnabled,
    required this.schedule,
  });

  factory MedicationSettings.fromJson(Map<String, dynamic> json) {
    return MedicationSettings(
      reminderEnabled: json['reminderEnabled'] as bool? ?? false,
      schedule: (json['schedule'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          ['08:00', '20:00'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'reminderEnabled': reminderEnabled,
      'schedule': schedule,
    };
  }

  MedicationSettings copyWith({
    bool? reminderEnabled,
    List<String>? schedule,
  }) {
    return MedicationSettings(
      reminderEnabled: reminderEnabled ?? this.reminderEnabled,
      schedule: schedule ?? this.schedule,
    );
  }
}

/// 感度レベル
enum Sensitivity {
  low,
  normal,
  high;

  String get label {
    switch (this) {
      case Sensitivity.low:
        return '低';
      case Sensitivity.normal:
        return '標準';
      case Sensitivity.high:
        return '高';
    }
  }

  static Sensitivity fromString(String? value) {
    switch (value) {
      case 'low':
        return Sensitivity.low;
      case 'high':
        return Sensitivity.high;
      default:
        return Sensitivity.normal;
    }
  }
}
