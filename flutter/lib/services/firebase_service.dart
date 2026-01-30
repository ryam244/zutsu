import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:zutsu_log/models/health_log.dart';

/// Firebase サービス
class FirebaseService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// 現在のユーザー
  static User? get currentUser => _auth.currentUser;

  /// 匿名認証でサインイン
  static Future<User?> signInAnonymously() async {
    try {
      final result = await _auth.signInAnonymously();
      return result.user;
    } catch (e) {
      print('Anonymous sign in error: $e');
      return null;
    }
  }

  /// 認証状態の監視
  static Stream<User?> authStateChanges() => _auth.authStateChanges();

  /// ユーザードキュメントの取得・作成
  static Future<Map<String, dynamic>?> getOrCreateUser({
    String? prefecture,
    String? city,
  }) async {
    final user = currentUser;
    if (user == null) return null;

    final userRef = _firestore.collection('users').doc(user.uid);
    final userSnap = await userRef.get();

    if (!userSnap.exists) {
      final newUser = {
        'email': user.email,
        'prefecture': prefecture ?? '東京都',
        'city': city ?? '千代田区',
        'createdAt': FieldValue.serverTimestamp(),
      };
      await userRef.set(newUser);
      return {'id': user.uid, ...newUser};
    }

    return {'id': user.uid, ...userSnap.data()!};
  }

  /// 体調記録を追加
  static Future<String?> addHealthLog({
    required int severity,
    double? pressureHpa,
    String? memo,
    String? locationPrefecture,
    String? locationCity,
  }) async {
    final user = currentUser;
    if (user == null) return null;

    try {
      final logsRef = _firestore
          .collection('users')
          .doc(user.uid)
          .collection('health_logs');

      final docRef = await logsRef.add({
        'severity': severity,
        'pressureHpa': pressureHpa,
        'memo': memo,
        'locationPrefecture': locationPrefecture,
        'locationCity': locationCity,
        'createdAt': FieldValue.serverTimestamp(),
      });

      return docRef.id;
    } catch (e) {
      print('Add health log error: $e');
      return null;
    }
  }

  /// 体調記録を取得
  static Future<List<HealthLog>> getHealthLogs({int limit = 50}) async {
    final user = currentUser;
    if (user == null) return [];

    try {
      final logsRef = _firestore
          .collection('users')
          .doc(user.uid)
          .collection('health_logs');

      final snapshot = await logsRef
          .orderBy('createdAt', descending: true)
          .limit(limit)
          .get();

      return snapshot.docs.map((doc) => HealthLog.fromFirestore(doc)).toList();
    } catch (e) {
      print('Get health logs error: $e');
      return [];
    }
  }

  /// 気象キャッシュを取得
  static Future<Map<String, dynamic>?> getWeatherCache(
    String prefecture,
    String city,
  ) async {
    try {
      final cacheId = '${prefecture}_$city';
      final cacheRef = _firestore.collection('weather_cache').doc(cacheId);
      final cacheSnap = await cacheRef.get();

      if (!cacheSnap.exists) return null;

      final data = cacheSnap.data()!;
      final fetchedAt = (data['fetchedAt'] as Timestamp?)?.toDate();
      final now = DateTime.now();

      // 30分以上経過していたらキャッシュ無効
      if (fetchedAt != null &&
          now.difference(fetchedAt).inMinutes > 30) {
        return null;
      }

      return data;
    } catch (e) {
      print('Get weather cache error: $e');
      return null;
    }
  }
}
