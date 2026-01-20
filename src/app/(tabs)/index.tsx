import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows, layout } from '@/theme';

// 仮の気圧データ
const MOCK_PRESSURE = {
  current: 1013,
  change: -5,
  status: 'danger' as const,
  forecast: '2時間後に気圧が急低下します',
  advice: '大幅な気圧の変化が予想されます。早めの休息を心がけてください。',
};

// 体調レベル
const SEVERITY_OPTIONS = [
  { level: 0, emoji: '😊', label: 'なし' },
  { level: 1, emoji: '😐', label: '少し痛む' },
  { level: 2, emoji: '😫', label: '痛い' },
  { level: 3, emoji: '🤮', label: 'かなり痛い' },
] as const;

export default function DashboardScreen() {
  const handleSeverityPress = (level: number) => {
    // TODO: 体調記録を保存
    console.log('Selected severity:', level);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>東京都 港区 • 1月20日</Text>
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
        {/* 気圧警戒アラート */}
        <View style={styles.alertSection}>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeIcon}>⚠️</Text>
            <Text style={styles.alertBadgeText}>気圧警戒</Text>
          </View>
          <Text style={styles.alertTitle}>{MOCK_PRESSURE.forecast}</Text>
          <Text style={styles.alertDescription}>
            {MOCK_PRESSURE.advice}リスク：高
          </Text>
        </View>

        {/* 気圧カード */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <View>
              <Text style={styles.pressureLabel}>現在の気圧</Text>
              <Text style={styles.pressureValue}>
                {MOCK_PRESSURE.current}{' '}
                <Text style={styles.pressureUnit}>hPa</Text>
              </Text>
            </View>
            <View style={styles.pressureChange}>
              <View style={styles.pressureChangeBadge}>
                <Text style={styles.pressureChangeIcon}>📉</Text>
                <Text style={styles.pressureChangeText}>{MOCK_PRESSURE.change}%</Text>
              </View>
              <Text style={styles.pressureChangeLabel}>急降下中</Text>
            </View>
          </View>

          {/* 気圧グラフ（プレースホルダー） */}
          <View style={styles.graphContainer}>
            <View style={styles.graphPlaceholder}>
              <Text style={styles.graphPlaceholderText}>📈 気圧グラフ</Text>
              <Text style={styles.graphPlaceholderSubtext}>
                ここに24時間の気圧変動グラフを表示
              </Text>
            </View>
            <View style={styles.graphTimeLabels}>
              <Text style={styles.graphTimeLabel}>現在</Text>
              <Text style={styles.graphTimeLabel}>12:00</Text>
              <Text style={styles.graphTimeLabel}>18:00</Text>
              <Text style={styles.graphTimeLabel}>00:00</Text>
              <Text style={styles.graphTimeLabel}>06:00</Text>
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
                ]}
                onPress={() => handleSeverityPress(option.level)}
              >
                <Text style={styles.healthEmoji}>{option.emoji}</Text>
                <Text style={styles.healthLabel}>{option.label}</Text>
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
  alertBadgeIcon: {
    fontSize: 12,
  },
  alertBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.dangerText,
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
  pressureChangeIcon: {
    fontSize: 12,
  },
  pressureChangeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.dangerText,
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
  healthEmoji: {
    fontSize: 36,
    marginBottom: spacing.md,
  },
  healthLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMain,
  },
});
