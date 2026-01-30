import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:zutsu_log/theme/app_colors.dart';

/// 体調記録
class HealthLog {
  final String? id;
  final String userId;
  final SeverityLevel severity;
  final double? pressureHpa;
  final String? memo;
  final String? locationPrefecture;
  final String? locationCity;
  final DateTime createdAt;

  const HealthLog({
    this.id,
    required this.userId,
    required this.severity,
    this.pressureHpa,
    this.memo,
    this.locationPrefecture,
    this.locationCity,
    required this.createdAt,
  });

  factory HealthLog.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return HealthLog(
      id: doc.id,
      userId: data['userId'] as String? ?? '',
      severity: _parseSeverity(data['severity'] as int? ?? 0),
      pressureHpa: (data['pressureHpa'] as num?)?.toDouble(),
      memo: data['memo'] as String?,
      locationPrefecture: data['locationPrefecture'] as String?,
      locationCity: data['locationCity'] as String?,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'severity': severity.index,
      'pressureHpa': pressureHpa,
      'memo': memo,
      'locationPrefecture': locationPrefecture,
      'locationCity': locationCity,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  static SeverityLevel _parseSeverity(int value) {
    switch (value) {
      case 0:
        return SeverityLevel.none;
      case 1:
        return SeverityLevel.mild;
      case 2:
        return SeverityLevel.moderate;
      case 3:
        return SeverityLevel.severe;
      default:
        return SeverityLevel.none;
    }
  }
}

/// 体調レベルの表示情報
class SeverityInfo {
  final SeverityLevel level;
  final String emoji;
  final String label;

  const SeverityInfo({
    required this.level,
    required this.emoji,
    required this.label,
  });

  static const List<SeverityInfo> all = [
    SeverityInfo(level: SeverityLevel.none, emoji: '😊', label: 'なし'),
    SeverityInfo(level: SeverityLevel.mild, emoji: '😐', label: '少し痛む'),
    SeverityInfo(level: SeverityLevel.moderate, emoji: '😫', label: '痛い'),
    SeverityInfo(level: SeverityLevel.severe, emoji: '🤮', label: 'かなり痛い'),
  ];
}
