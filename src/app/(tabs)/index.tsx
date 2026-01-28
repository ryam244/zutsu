import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '@/theme';
import { fetchWeatherData } from '@/services/weather';
import { useAppStore } from '@/stores/appStore';
import type { WeatherData, SeverityLevel } from '@/types';

// 体調レベル
const SEVERITY_OPTIONS = [
  { level: 0 as SeverityLevel, emoji: '😊', label: 'なし' },
  { level: 1 as SeverityLevel, emoji: '😐', label: '少し痛む' },
  { level: 2 as SeverityLevel, emoji: '😫', label: '痛い' },
  { level: 3 as SeverityLevel, emoji: '🤮', label: 'かなり痛い' },
] as const;

// 状態に応じたメッセージ
const STATUS_MESSAGES = {
  danger: {
    forecast: '気圧が急低下しています',
    advice: '大幅な気圧の変化が予想されます。早めの休息を心がけてください。',
    risk: '高',
    changeLabel: '急降下中',
    icon: '📉',
  },
  caution: {
    forecast: '気圧がやや低下しています',
    advice: '気圧の変化に注意してください。無理をしないようにしましょう。',
    risk: '中',
    changeLabel: '低下中',
    icon: '📉',
  },
  stable: {
    forecast: '気圧は安定しています',
    advice: '現在の気圧は安定しています。快適にお過ごしください。',
    risk: '低',
    changeLabel: '安定',
    icon: '📊',
  },
};

export default function DashboardScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | null>(null);

  const settings = useAppStore((state) => state.settings);
  const { prefecture, city } = settings.location;

  // 気象データを取得
  const loadWeatherData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchWeatherData(prefecture, city);
      setWeather(data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setIsLoading(false);
    }
  }, [prefecture, city]);

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const handleSeverityPress = (level: SeverityLevel) => {
    setSelectedSeverity(level);
    // TODO: Firebase に体調記録を保存
    console.log('Selected severity:', level);
  };

  // 今日の日付
  const today = new Date();
  const dateString = `${today.getMonth() + 1}月${today.getDate()}日`;

  // 気象データの状態メッセージ
  const status = weather?.status || 'stable';
  const statusMessage = STATUS_MESSAGES[status];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{prefecture} {city} • {dateString}</Text>
        </View>
        <Pressable style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>気象データを取得中...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 気圧警戒アラート */}
          {status !== 'stable' && (
            <View style={styles.alertSection}>
              <View style={[
                styles.alertBadge,
                status === 'caution' && styles.alertBadgeCaution,
              ]}>
                <Text style={styles.alertBadgeIcon}>⚠️</Text>
                <Text style={[
                  styles.alertBadgeText,
                  status === 'caution' && styles.alertBadgeTextCaution,
                ]}>
                  {status === 'danger' ? '気圧警戒' : '気圧注意'}
                </Text>
              </View>
              <Text style={styles.alertTitle}>{statusMessage.forecast}</Text>
              <Text style={styles.alertDescription}>
                {statusMessage.advice}リスク：{statusMessage.risk}
              </Text>
            </View>
          )}

          {/* 安定時のメッセージ */}
          {status === 'stable' && (
            <View style={styles.stableSection}>
              <View style={styles.stableBadge}>
                <Text style={styles.stableBadgeIcon}>✨</Text>
                <Text style={styles.stableBadgeText}>気圧安定</Text>
              </View>
              <Text style={styles.stableTitle}>{statusMessage.forecast}</Text>
              <Text style={styles.stableDescription}>{statusMessage.advice}</Text>
            </View>
          )}

          {/* 気圧カード */}
          <View style={styles.pressureCard}>
            <View style={styles.pressureHeader}>
              <View>
                <Text style={styles.pressureLabel}>現在の気圧</Text>
                <Text style={styles.pressureValue}>
                  {weather?.pressure || 1013}{' '}
                  <Text style={styles.pressureUnit}>hPa</Text>
                </Text>
              </View>
              <View style={styles.pressureChange}>
                <View style={[
                  styles.pressureChangeBadge,
                  status === 'caution' && styles.pressureChangeBadgeCaution,
                  status === 'stable' && styles.pressureChangeBadgeStable,
                ]}>
                  <Text style={styles.pressureChangeIcon}>{statusMessage.icon}</Text>
                  <Text style={[
                    styles.pressureChangeText,
                    status === 'caution' && styles.pressureChangeTextCaution,
                    status === 'stable' && styles.pressureChangeTextStable,
                  ]}>
                    {weather?.pressureChange || 0}%
                  </Text>
                </View>
                <Text style={styles.pressureChangeLabel}>{statusMessage.changeLabel}</Text>
              </View>
            </View>

            {/* 気圧グラフ（プレースホルダー） */}
            <View style={styles.graphContainer}>
              <View style={styles.graphPlaceholder}>
                <Text style={styles.graphPlaceholderText}>📈 気圧グラフ</Text>
                <Text style={styles.graphPlaceholderSubtext}>
                  24時間の気圧変動を表示
                </Text>
              </View>
              <View style={styles.graphTimeLabels}>
                <Text style={styles.graphTimeLabel}>現在</Text>
                <Text style={styles.graphTimeLabel}>6h後</Text>
                <Text style={styles.graphTimeLabel}>12h後</Text>
                <Text style={styles.graphTimeLabel}>18h後</Text>
                <Text style={styles.graphTimeLabel}>24h後</Text>
              </View>
            </View>

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
                >
                  <Text style={styles.healthEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.healthLabel,
                    selectedSeverity === option.level && styles.healthLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textSub,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    paddingBottom: spacing['4xl'],
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
    backgroundColor: 'rgba(252, 165, 165, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.3)',
    marginBottom: spacing.lg,
  },
  alertBadgeCaution: {
    backgroundColor: 'rgba(253, 224, 71, 0.1)',
    borderColor: 'rgba(253, 224, 71, 0.3)',
  },
  alertBadgeIcon: {
    fontSize: 12,
  },
  alertBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.dangerText,
    letterSpacing: 1,
  },
  alertBadgeTextCaution: {
    color: colors.cautionText,
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
  stableSection: {
    marginBottom: spacing['3xl'],
  },
  stableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(147, 197, 253, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.3)',
    marginBottom: spacing.lg,
  },
  stableBadgeIcon: {
    fontSize: 12,
  },
  stableBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  stableTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    lineHeight: 32,
  },
  stableDescription: {
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
    borderColor: 'rgba(96, 165, 250, 0.1)',
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
    backgroundColor: 'rgba(252, 165, 165, 0.1)',
    borderRadius: borderRadius.full,
  },
  pressureChangeBadgeCaution: {
    backgroundColor: 'rgba(253, 224, 71, 0.1)',
  },
  pressureChangeBadgeStable: {
    backgroundColor: 'rgba(147, 197, 253, 0.1)',
  },
  pressureChangeIcon: {
    fontSize: 12,
  },
  pressureChangeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.dangerText,
  },
  pressureChangeTextCaution: {
    color: colors.cautionText,
  },
  pressureChangeTextStable: {
    color: colors.primary,
  },
  pressureChangeLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  graphContainer: {
    marginBottom: spacing.xl,
  },
  graphPlaceholder: {
    height: 160,
    backgroundColor: colors.bgSoft,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphPlaceholderText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  graphPlaceholderSubtext: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  graphTimeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  graphTimeLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textLight,
    textTransform: 'uppercase',
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
    borderWidth: 2,
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
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
  healthLabelSelected: {
    color: colors.primary,
  },
});
