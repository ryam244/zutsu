# PROJECT_PLAN.md - Zutsu-Log (頭痛ログ)

**最終更新:** 2026-01-20
**ステータス:** 開発準備中

---

## 1. プロジェクト概要

### アプリ名
**Zutsu-Log (頭痛ログ)** - 気圧と頭痛の相関を可視化するヘルスケアアプリ

### ビジョン
> 「天気に振り回される人生を、コントロール可能なものに変える」

### コアバリュー
1. **ペイン・ファーストUI** - 天気予報ではなく「痛み予報」を最優先
2. **究極のシンプルさ** - 起動から記録完了まで1秒
3. **納得感によるメンタルケア** - 「やはり気圧のせいだった」を可視化

---

## 2. 技術スタック

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| Framework | React Native (Expo) | SDK 52 |
| Language | TypeScript | 5.x |
| State | Zustand | 5.x |
| Backend | Firebase (Auth + Firestore) | 10.x |
| Functions | Firebase Cloud Functions | - |
| API | OpenWeatherMap One Call API 3.0 | - |
| Navigation | Expo Router | 4.x |

### コスト最適化アーキテクチャ

```
┌─────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│   ユーザー   │ ───→ │  Cloud Functions     │ ───→ │ OpenWeatherMap  │
│  (N人)      │      │   (プロキシ+キャッシュ)  │      │     API        │
└─────────────┘      └──────────────────────┘      └─────────────────┘
                              │
                              ↓
                     ┌──────────────────┐
                     │  Firestore       │
                     │  weather_cache   │
                     │  (地域単位保存)   │
                     └──────────────────┘
```

**キャッシュ戦略:**
- 地域（市区町村）単位でキャッシュ
- キャッシュ有効期限: 30分
- 同一地域の複数ユーザーは同一データを参照
- ユーザー数に比例しないAPI呼び出し

---

## 3. デザイントークン

### カラーパレット

```typescript
colors: {
  primary: '#4A90E2',      // メインブルー
  primaryLight: '#60a5fa', // ライトブルー
  accent: '#64B5F6',       // アクセントブルー

  // ステータスカラー
  danger: '#fca5a5',       // 警戒（気圧急降下）
  dangerDark: '#F06292',   // 重度
  caution: '#fde047',      // 注意
  cautionOrange: '#FFB74D',// 中度
  stable: '#93c5fd',       // 安定
  success: '#4ADE80',      // 成功/ON

  // 背景・テキスト
  bgMain: '#F8FAFC',       // メイン背景
  surface: '#FFFFFF',      // カード背景
  textMain: '#334155',     // メインテキスト
  textSub: '#64748B',      // サブテキスト
  textMuted: '#94A3B8',    // ミュートテキスト
  divider: '#F1F5F9',      // 区切り線
}
```

### タイポグラフィ

```typescript
fontFamily: {
  sans: ['Noto Sans JP', 'Inter', 'sans-serif']
}

fontSize: {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 24,
  '3xl': 30,
}
```

### スペーシング

```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
}
```

### 角丸

```typescript
borderRadius: {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
}
```

---

## 4. 画面構成

### ボトムナビゲーション

| タブ | アイコン | 画面 |
|------|---------|------|
| ホーム | home | ダッシュボード |
| 履歴 | history | 記録履歴 |
| 分析 | bar_chart | 分析（Phase 2） |
| 設定 | settings | 設定 |

### 画面一覧

1. **ダッシュボード** (`/(tabs)/index`)
   - 気圧警戒バッジ
   - 現在の気圧表示
   - 気圧グラフ（24時間）
   - 体調記録ボタン（4段階）

2. **記録履歴** (`/(tabs)/history`)
   - 気圧との相関カード
   - タイムライン形式の履歴
   - 週間/月間切り替え

3. **分析** (`/(tabs)/analysis`) - Phase 2
   - 統計データ
   - トリガー分析

4. **設定** (`/(tabs)/settings`)
   - プレミアムバナー
   - 地域設定
   - 通知設定
   - 服薬管理

---

## 5. データモデル

### Firestore Collections

```typescript
// users/{userId}
interface UserDoc {
  email: string;
  prefecture: string;
  city: string;
  createdAt: Timestamp;
}

// users/{userId}/health_logs/{logId}
interface HealthLogDoc {
  severity: 0 | 1 | 2 | 3;  // 0: なし, 1: 少し痛む, 2: 痛い, 3: かなり痛い
  pressureHpa: number | null;
  memo: string | null;
  locationPrefecture: string | null;
  locationCity: string | null;
  createdAt: Timestamp;
}

// weather_cache/{prefecture}_{city}
interface WeatherCacheDoc {
  prefecture: string;
  city: string;
  data: WeatherData;
  fetchedAt: Timestamp;
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザードキュメント
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // 体調記録（サブコレクション）
      match /health_logs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // 気象キャッシュ（読み取り専用、書き込みはCloud Functionsのみ）
    match /weather_cache/{cacheId} {
      allow read: if request.auth != null;
      allow write: if false;  // Cloud Functionsからのみ書き込み
    }
  }
}
```

### Zustand Store

```typescript
interface AppState {
  // ユーザー
  user: User | null;

  // 現在の気象
  currentWeather: WeatherData | null;

  // 体調記録
  healthLogs: HealthLog[];

  // 設定
  settings: {
    location: { prefecture: string; city: string };
    notifications: {
      pressureAlert: boolean;
      cautionAlert: boolean;
      sensitivity: 'low' | 'normal' | 'high';
    };
    medication: {
      reminderEnabled: boolean;
      schedule: string[];
    };
  };
}
```

---

## 6. MVP機能と優先度

### Phase 1 - MVP

| 優先度 | 機能 | 状態 |
|--------|------|------|
| High | 気圧グラフ表示 | 未着手 |
| High | ワンタップ体調記録（4段階） | 未着手 |
| High | 気圧低下アラート（通知） | 未着手 |
| Medium | 地点登録 | 未着手 |
| Medium | 記録プロット表示 | 未着手 |

### Phase 2 - 収益化

- プレミアムプラン（広告除去、複数地点）
- 詳細分析機能
- 長期データ閲覧

---

## 7. ディレクトリ構造

```
src/
├── app/                    # Expo Router
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # ダッシュボード
│   │   ├── history.tsx     # 記録履歴
│   │   ├── analysis.tsx    # 分析
│   │   └── settings.tsx    # 設定
│   └── _layout.tsx
├── components/
│   ├── common/             # 共通コンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── dashboard/          # ダッシュボード用
│   │   ├── PressureAlert.tsx
│   │   ├── PressureGraph.tsx
│   │   └── HealthButtons.tsx
│   ├── history/            # 履歴用
│   │   ├── CorrelationCard.tsx
│   │   └── Timeline.tsx
│   └── settings/           # 設定用
│       ├── PremiumBanner.tsx
│       └── SettingItem.tsx
├── hooks/
│   ├── useWeather.ts
│   └── useHealthLog.ts
├── stores/
│   └── appStore.ts
├── services/
│   ├── firebase.ts
│   └── weather.ts
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
├── types/
│   └── index.ts
└── utils/
    └── pressure.ts
```

---

## 8. 開発フロー

1. ~~PROJECT_PLAN.md を作成~~
2. テーマファイル（カラー・フォント）を作成
3. Expo プロジェクトを初期化
4. プロジェクト構造（ディレクトリ）を作成
5. 基本コンポーネントのスケルトンを作成
6. Firebase 接続設定
7. 各画面の実装

---

## 9. 注意事項

- **ハードコード禁止**: 色・フォント・間隔は全てテーマファイルから参照
- **Material Symbols**: アイコンは細線ミニマル（weight: 300-400）
- **Security Rules必須**: Firestoreのセキュリティルールを徹底
- **医療免責**: アプリ内で「医学的診断ではない」旨を明記
