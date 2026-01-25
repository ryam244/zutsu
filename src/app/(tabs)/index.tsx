import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '@/theme';
import { useAppStore } from '@/stores/appStore';
import { firestoreHelpers } from '@/services/firebase';
import { useWeather } from '@/hooks/useWeather';
import PressureGraph, { type PressurePoint } from '@/components/dashboard/PressureGraph';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - spacing.xl * 2 - spacing['2xl'] * 2;

// フォールバック用モックデータ
const MOCK_PRESSURE_DATA: PressurePoint[] = [
  { time: '現在', pressure: 1013, status: 'stable' },
  { time: '09:00', pressure: 1015, status: 'stable' },
  { time: '12:00', pressure: 1010, status: 'caution' },
  { time: '15:00', pressure: 1002, status: 'danger' },
  { time: '18:00', pressure: 998, status: 'danger' },
  { time: '21:00', pressure: 1005, status: 'caution' },
  { time: '00:00', pressure: 1010, status: 'stable' },
  { time: '03:00', pressure: 1012, status: 'stable' },
  { time: '06:00', pressure: 1015, status: 'stable' },
];

// 体調レベル
const SEVERITY_OPTIONS = [
  { level: 0, emoji: '😊', label: 'なし' },
  { level: 1, emoji: '😐', label: '少し痛む' },
  { level: 2, emoji: '😫', label: '痛い' },
  { level: 3, emoji: '🤮', label: 'かなり痛い' },
] as const;

// ステータスに応じたバッジ設定
const STATUS_CONFIG = {
  danger: {
    label: '気圧警戒',
    icon: '⚠️',
    changeIcon: '📉',
    changeLabel: '急変動中',
    bgColor: 'rgba(252, 165, 165, 0.1)',
    borderColor: 'rgba(252, 165, 165, 0.3)',
    textColor: colors.dangerText,
  },
  caution: {
    label: '注意',
    icon: '⚡',
    changeIcon: '📊',
    changeLabel: '変動中',
    bgColor: 'rgba(253, 224, 71, 0.1)',
    borderColor: 'rgba(253, 224, 71, 0.3)',
    textColor: colors.cautionText,
  },
  stable: {
    label: '安定',
    icon: '✨',
    changeIcon: '📈',
    changeLabel: '安定',
    bgColor: 'rgba(147, 197, 253, 0.1)',
    borderColor: 'rgba(147, 197, 253, 0.3)',
    textColor: colors.stableText,
  },
};

export default function DashboardScreen() {
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const user = useAppStore((state) => state.user);
  const addHealthLog = useAppStore((state) => state.addHealthLog);
  const settings = useAppStore((state) => state.settings);

  // 気象データを取得
  const { weather, isLoading, alertMessage, advice } = useWeather();

  // 気圧データ（API or モック）
  const currentPressure = weather?.pressure ?? 1013;
  const pressureChange = weather?.pressureChange ?? 0;
  const pressureStatus = weather?.status ?? 'stable';
  const statusConfig = STATUS_CONFIG[pressureStatus];

  // グラフ用データ
  const graphData: PressurePoint[] = weather?.forecast?.slice(0, 9).map((f) => ({
    time: f.time,
    pressure: f.pressure,
    status: f.status,
  })) ?? MOCK_PRESSURE_DATA;

  const handleSeverityPress = async (level: number) => {
    if (isRecording) return;

    setSelectedSeverity(level);
    setIsRecording(true);

    const now = new Date().toISOString();
    const logData = {
      severity: level as 0 | 1 | 2 | 3,
      pressureHpa: currentPressure,
      memo: null,
      locationPrefecture: settings.location.prefecture,
      locationCity: settings.location.city,
    };

    // Firestore に保存（ユーザーがログイン済みの場合）
    let logId = Date.now().toString();
    if (user?.id) {
      try {
        const firestoreId = await firestoreHelpers.addHealthLog(user.id, logData);
        logId = firestoreId;
      } catch (error) {
        console.error('Firestore save error:', error);
      }
    }

    // ローカルストレージにも保存
    const newLog = {
      id: logId,
      userId: user?.id || 'local',
      createdAt: now,
      ...logData,
    };

    addHealthLog(newLog);

    setTimeout(() => {
      setSelectedSeverity(null);
      setIsRecording(false);
    }, 1500);
  };

  // 現在の日付
  const today = new Date();
  const dateString = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {settings.location.prefecture} {settings.location.city} • {dateString}
          </Text>
        </View>
        <Pressable style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ローディング */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>気象データを取得中...</Text>
          </View>
        )}

        {/* 気圧警戒アラート */}
        <View style={styles.alertSection}>
          <View style={[styles.alertBadge, {
            backgroundColor: statusConfig.bgColor,
            borderColor: statusConfig.borderColor,
          }]}>
            <Text style={styles.alertBadgeIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.alertBadgeText, { color: statusConfig.textColor }]}>
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.alertTitle}>
            {alertMessage ?? '気象データを取得中...'}
          </Text>
          <Text style={styles.alertDescription}>
            {advice ?? ''}
          </Text>
        </View>

        {/* 気圧カード */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <View>
              <Text style={styles.pressureLabel}>現在の気圧</Text>
              <Text style={styles.pressureValue}>
                {currentPressure}{' '}
                <Text style={styles.pressureUnit}>hPa</Text>
              </Text>
            </View>
            <View style={styles.pressureChange}>
              <View style={[styles.pressureChangeBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Text style={styles.pressureChangeIcon}>{statusConfig.changeIcon}</Text>
                <Text style={[styles.pressureChangeText, { color: statusConfig.textColor }]}>
                  {pressureChange > 0 ? '+' : ''}{pressureChange}%
                </Text>
              </View>
              <Text style={styles.pressureChangeLabel}>{statusConfig.changeLabel}</Text>
            </View>
          </View>

          {/* 気圧グラフ */}
          <PressureGraph data={graphData} width={GRAPH_WIDTH} />

          {/* 凡例 */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
              <Text style={styles.legendText}>警戒</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.caution }]} />
              <Text style={styles.legendText}>注意</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.stable }]} />
              <Text style={styles.legendText}>安定</Text>
            </View>
          </View>
        </View>

        {/* 体調記録 */}
        <View style={styles.healthSection}>
          <Text style={styles.healthTitle}>今の体調はどうですか？</Text>
          <View style={styles.healthGrid}>
            {SEVERITY_OPTIONS.map((option) => (
              <Pressable
                key={option.level}
                style={({ pressed }) => [
                  styles.healthButton,
                  pressed && styles.healthButtonPressed,
                  selectedSeverity === option.level && styles.healthButtonSelected,
                ]}
                onPress={() => handleSeverityPress(option.level)}
                disabled={isRecording}
              >
                <Text style={styles.healthEmoji}>{option.emoji}</Text>
                <Text style={styles.healthLabel}>{option.label}</Text>
                {selectedSeverity === option.level && (
                  <Text style={styles.recordedText}>記録しました ✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceGlass,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  locationIcon: {
    fontSize: 18,
  },
  locationText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  notificationButton: {
    padding: spacing.md,
  },
  notificationIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textSub,
  },
  alertSection: {
    marginBottom: spacing['3xl'],
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  alertBadgeIcon: {
    fontSize: 12,
  },
  alertBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  alertTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    lineHeight: 32,
  },
  alertDescription: {
    fontSize: fontSize.sm,
    color: colors.textSub,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  pressureCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    marginBottom: spacing['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(48, 171, 232, 0.1)',
    ...shadows.sm,
  },
  pressureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  pressureLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  pressureValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  pressureUnit: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  pressureChange: {
    alignItems: 'flex-end',
  },
  pressureChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  pressureChangeIcon: {
    fontSize: 12,
  },
  pressureChangeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  pressureChangeLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  legendText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  healthSection: {
    paddingBottom: spacing['4xl'],
  },
  healthTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.xl,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  healthButton: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.sm,
  },
  healthButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  healthButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(48, 171, 232, 0.05)',
  },
  healthEmoji: {
    fontSize: 36,
    marginBottom: spacing.md,
  },
  healthLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMain,
  },
  recordedText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: fontWeight.medium,
  },
});
