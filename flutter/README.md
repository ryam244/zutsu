# Zutsu-Log (頭痛ログ) - Flutter版

気圧と頭痛の相関を可視化するヘルスケアアプリ

## セットアップ手順

### 1. Flutter環境でプロジェクトを初期化

```bash
# このディレクトリで実行
flutter create . --org com.zutsulog --project-name zutsu_log
```

### 2. Firebase設定ファイルを配置

```bash
# iOS
cp ~/Downloads/GoogleService-Info.plist ios/Runner/

# Android（必要な場合）
cp ~/Downloads/google-services.json android/app/
```

### 3. 依存関係をインストール

```bash
flutter pub get
```

### 4. iOS向けの追加設定

`ios/Podfile` の先頭に以下を追加：

```ruby
platform :ios, '13.0'
```

その後：

```bash
cd ios && pod install && cd ..
```

### 5. 実行

```bash
# iOS シミュレーター
flutter run

# 実機
flutter run --release
```

## プロジェクト構造

```
lib/
├── main.dart              # エントリーポイント
├── models/                # データモデル
│   ├── weather_data.dart
│   └── health_log.dart
├── screens/               # 画面
│   ├── main_screen.dart   # タブナビゲーション
│   ├── home_screen.dart   # ダッシュボード
│   ├── history_screen.dart
│   ├── analysis_screen.dart
│   └── settings_screen.dart
├── services/              # サービス層
│   ├── firebase_service.dart
│   └── weather_service.dart
├── theme/                 # テーマ定義
│   ├── app_theme.dart
│   └── app_colors.dart
├── widgets/               # 共通ウィジェット
│   ├── pressure_card.dart
│   └── severity_button.dart
└── providers/             # 状態管理（Riverpod）
```

## Firebase設定

1. Firebase Console で iOS アプリを追加
   - Bundle ID: `com.zutsulog.zutsuLog`

2. Authentication で匿名認証を有効化

3. Firestore Database を作成

4. Cloud Functions をデプロイ（気象API用）

## 技術スタック

- Flutter 3.x
- Firebase (Auth, Firestore, Functions)
- Riverpod (状態管理)
- OpenWeatherMap API (気象データ)
