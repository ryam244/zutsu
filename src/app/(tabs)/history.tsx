import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '@/theme';
import { useAppStore } from '@/stores/appStore';
import type { HealthLog, SeverityLevel } from '@/types';

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  0: 'なし',
  1: '少し痛む',
  2: '痛い',
  3: 'かなり痛い',
};

const SEVERITY_ICONS: Record<SeverityLevel, string> = {
  0: '😊',
  1: '😐',
  2: '😫',
  3: '🤮',
};

// 気圧状態を判定
const getPressureStatus = (pressure: number | null): 'danger' | 'caution' | 'stable' => {
  if (!pressure) return 'stable';
  if (pressure < 1005) return 'danger';
  if (pressure < 1010) return 'caution';
  return 'stable';
};

// 日付でグループ化
const groupLogsByDate = (logs: HealthLog[]) => {
  const groups: Record<string, HealthLog[]> = {};

  logs.forEach((log) => {
    const date = new Date(log.createdAt);
    const dateKey = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(log);
  });

  return Object.entries(groups).map(([date, records]) => ({
    date,
    records: records.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  }));
};

// 時間をフォーマット
const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function HistoryScreen() {
  const router = useRouter();
  const healthLogs = useAppStore((state) => state.healthLogs);
  const [filter, setFilter] = useState<'weekly' | 'monthly'>('weekly');

  // 記録をグループ化
  const groupedLogs = useMemo(() => groupLogsByDate(healthLogs), [healthLogs]);

  // 相関分析（簡易版）
  const correlation = useMemo(() => {
    if (healthLogs.length === 0) return { rate: 0, trigger: '---' };

    const logsWithPressure = healthLogs.filter((log) => log.pressureHpa !== null);
    const lowPressureLogs = logsWithPressure.filter(
      (log) => log.pressureHpa !== null && log.pressureHpa < 1010
    );

    const rate =
      logsWithPressure.length > 0
        ? Math.round((lowPressureLogs.length / logsWithPressure.length) * 100)
        : 0;

    return {
      rate,
      trigger: rate > 50 ? '低気圧' : '不明',
    };
  }, [healthLogs]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>記録履歴</Text>
        <Pressable style={styles.helpButton}>
          <Text style={styles.helpIcon}>❓</Text>
        </Pressable>
      </View>

      {/* フィルタータブ */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          <Pressable
            style={[styles.filterTab, filter === 'weekly' && styles.filterTabActive]}
            onPress={() => setFilter('weekly')}
          >
            <Text
              style={[styles.filterTabText, filter === 'weekly' && styles.filterTabTextActive]}
            >
              週間
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterTab, filter === 'monthly' && styles.filterTabActive]}
            onPress={() => setFilter('monthly')}
          >
            <Text
              style={[styles.filterTabText, filter === 'monthly' && styles.filterTabTextActive]}
            >
              月間
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 相関分析カード */}
        <View style={styles.correlationSection}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionIcon}>📊 </Text>
            気圧との相関
          </Text>
          <View style={styles.correlationCards}>
            <View style={styles.correlationCard}>
              <Text style={styles.correlationLabel}>気圧との関連度</Text>
              <Text style={styles.correlationValue}>
                {healthLogs.length > 0 ? `${correlation.rate}%` : '---'}
              </Text>
              <View style={styles.correlationTrend}>
                <Text style={styles.trendIcon}>📈</Text>
                <Text style={styles.trendText}>
                  {correlation.rate > 70
                    ? '非常に関連が強い'
                    : correlation.rate > 40
                      ? '関連あり'
                      : 'データ収集中'}
                </Text>
              </View>
            </View>
            <View style={styles.correlationCard}>
              <Text style={styles.correlationLabel}>主なトリガー</Text>
              <Text style={styles.triggerValue}>{correlation.trigger}</Text>
              <Text style={styles.triggerNote}>
                {correlation.rate > 50 ? '1010hPa以下で発生' : '記録を続けてください'}
              </Text>
            </View>
          </View>
          {healthLogs.length > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                {correlation.rate > 50
                  ? '記録の多くが低気圧時に発生しています。気圧の変化に敏感なタイプかもしれません。'
                  : '記録を続けることで、あなたの頭痛パターンが見えてきます。'}
              </Text>
            </View>
          )}
        </View>

        {/* 記録がない場合 */}
        {groupedLogs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>まだ記録がありません</Text>
            <Text style={styles.emptyText}>
              ホーム画面から体調を記録すると、ここに履歴が表示されます
            </Text>
          </View>
        )}

        {/* タイムライン */}
        {groupedLogs.map((dayLog) => (
          <View key={dayLog.date}>
            <Text style={styles.dateLabel}>{dayLog.date}</Text>
            <View style={styles.timeline}>
              {dayLog.records.map((record, index) => {
                const pressureStatus = getPressureStatus(record.pressureHpa);
                return (
                  <View key={record.id} style={styles.timelineItem}>
                    <View style={styles.timelineLine}>
                      <View
                        style={[
                          styles.timelineIcon,
                          record.severity >= 2
                            ? styles.timelineIconDanger
                            : styles.timelineIconNormal,
                        ]}
                      >
                        <Text style={styles.timelineIconText}>
                          {SEVERITY_ICONS[record.severity as SeverityLevel]}
                        </Text>
                      </View>
                      {index < dayLog.records.length - 1 && (
                        <View style={styles.timelineConnector} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <View>
                          <Text style={styles.timeText}>{formatTime(record.createdAt)}</Text>
                          <Text style={styles.severityLabel}>
                            {SEVERITY_LABELS[record.severity as SeverityLevel]}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            pressureStatus === 'danger' && styles.statusBadgeDanger,
                            pressureStatus === 'stable' && styles.statusBadgeStable,
                          ]}
                        >
                          <Text style={styles.statusBadgeText}>
                            {pressureStatus === 'danger'
                              ? '急降下'
                              : pressureStatus === 'caution'
                                ? '低気圧'
                                : '安定'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.recordCard}>
                        <View style={styles.pressureRow}>
                          <Text style={styles.pressureIcon}>📊</Text>
                          <Text style={styles.pressureText}>
                            {record.pressureHpa ?? '---'} hPa
                          </Text>
                          {record.severity >= 2 && (
                            <Text style={styles.warningTag}>要注意</Text>
                          )}
                        </View>
                        {record.memo && (
                          <Text style={styles.memoText}>「{record.memo}」</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => router.push('/')}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  filterContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceGlass,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgSoft,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  filterTabActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  filterTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSub,
  },
  filterTabTextActive: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  correlationSection: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    fontSize: fontSize.lg,
  },
  correlationCards: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  correlationCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.sm,
  },
  correlationLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSub,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  correlationValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  correlationTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  trendIcon: {
    fontSize: 12,
  },
  trendText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.success,
  },
  triggerValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.cautionOrange,
  },
  triggerNote: {
    fontSize: fontSize.xs,
    color: colors.textSub,
    marginTop: spacing.xs,
  },
  insightCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(48, 171, 232, 0.05)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(48, 171, 232, 0.1)',
  },
  insightText: {
    fontSize: fontSize.xs,
    color: colors.textMain,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  dateLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSub,
    letterSpacing: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  timeline: {
    paddingHorizontal: spacing.xl,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing['3xl'],
  },
  timelineLine: {
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  timelineIconNormal: {
    backgroundColor: 'rgba(48, 171, 232, 0.1)',
    borderColor: 'rgba(48, 171, 232, 0.2)',
  },
  timelineIconDanger: {
    backgroundColor: 'rgba(240, 98, 146, 0.1)',
    borderColor: 'rgba(240, 98, 146, 0.2)',
  },
  timelineIconText: {
    fontSize: 16,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.divider,
    marginTop: spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  timeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSub,
  },
  severityLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textMain,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(48, 171, 232, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(48, 171, 232, 0.2)',
  },
  statusBadgeDanger: {
    backgroundColor: 'rgba(252, 165, 165, 0.1)',
    borderColor: 'rgba(252, 165, 165, 0.2)',
  },
  statusBadgeStable: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.divider,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.sm,
  },
  pressureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pressureIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  pressureText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMain,
  },
  warningTag: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.dangerDark,
    backgroundColor: 'rgba(240, 98, 146, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: 'auto',
  },
  memoText: {
    fontSize: fontSize.xs,
    color: colors.textSub,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing['2xl'],
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primaryLg,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.surface,
    fontWeight: fontWeight.bold,
  },
});
