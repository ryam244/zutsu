import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:zutsu_log/theme/app_theme.dart';
import 'package:zutsu_log/theme/app_colors.dart';
import 'package:zutsu_log/screens/main_screen.dart';

void main() {
  // グローバルエラーハンドリング
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    // Flutterフレームワークエラーのカスタムハンドリング
    FlutterError.onError = (FlutterErrorDetails details) {
      FlutterError.presentError(details);
      debugPrint('Flutter Error: ${details.exception}');
    };

    // ステータスバーのスタイル
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );

    // Firebase初期化（エラーハンドリング付き）
    bool firebaseInitialized = false;
    try {
      await Firebase.initializeApp();
      firebaseInitialized = true;
    } catch (e) {
      debugPrint('Firebase initialization error: $e');
      // Firebaseが初期化できなくてもアプリは起動する
    }

    runApp(
      ProviderScope(
        child: ZutsuLogApp(firebaseInitialized: firebaseInitialized),
      ),
    );
  }, (error, stack) {
    // 非同期エラーのキャッチ
    debugPrint('Uncaught error: $error');
    debugPrint('Stack trace: $stack');
  });
}

class ZutsuLogApp extends StatelessWidget {
  final bool firebaseInitialized;

  const ZutsuLogApp({
    super.key,
    required this.firebaseInitialized,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '頭痛ログ',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      // エラー境界でラップ
      builder: (context, child) {
        // エラーウィジェットのカスタマイズ
        ErrorWidget.builder = (FlutterErrorDetails details) {
          return _ErrorDisplay(details: details);
        };
        return child ?? const SizedBox.shrink();
      },
      home: firebaseInitialized
          ? const MainScreen()
          : const _FirebaseErrorScreen(),
    );
  }
}

/// Firebase初期化エラー画面
class _FirebaseErrorScreen extends StatelessWidget {
  const _FirebaseErrorScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.cloud_off_rounded,
                  size: 64,
                  color: AppColors.textMuted,
                ),
                const SizedBox(height: 24),
                const Text(
                  '接続エラー',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'サーバーに接続できませんでした。\nネットワーク接続を確認してください。',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSub,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () {
                    // アプリを再起動
                    SystemNavigator.pop();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('再試行'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// カスタムエラー表示ウィジェット
class _ErrorDisplay extends StatelessWidget {
  final FlutterErrorDetails details;

  const _ErrorDisplay({required this.details});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.bgMain,
      padding: const EdgeInsets.all(16),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: AppColors.dangerText,
            ),
            const SizedBox(height: 16),
            const Text(
              'エラーが発生しました',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'アプリを再起動してください',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSub,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
