/// ユーザーモデル
class User {
  final String id;
  final String? email;
  final String prefecture;
  final String city;
  final DateTime createdAt;

  const User({
    required this.id,
    this.email,
    required this.prefecture,
    required this.city,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String?,
      prefecture: json['prefecture'] as String? ?? '東京都',
      city: json['city'] as String? ?? '千代田区',
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'prefecture': prefecture,
      'city': city,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? prefecture,
    String? city,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      prefecture: prefecture ?? this.prefecture,
      city: city ?? this.city,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
