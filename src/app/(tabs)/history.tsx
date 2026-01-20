import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '@/theme';

// 仮の履歴データ
const MOCK_LOGS = [
  {
    id: '1',
    date: '2026年1月20日 (月)',
    records: [
      {
        id: '1-1',
        time: '10:45 AM',
        severity: 3,
        label: 'かなり痛む',
        pressure: 1002,
        pressureStatus: 'danger',
        memo: '雨が降り始めた直後から。目の奥がズキズキするような強い痛み。',
      },
      {
        id: '1-2',
        time: '02:30 PM',
        severity: 1,
        label: '少し痛む',
        pressure: 1014,
        pressureStatus: 'stable',
        memo: null,
      },
    ],
  },
  {
    id: '2',
    date: '2026年1月19日 (日)',
    records: [
      {
        id: '2-1',
        time: '08:15 PM',
        severity: 2,
        label: 'ふつうの痛み',
        pressure: 1005,
        pressureStatus: 'caution',
        memo: '夕方からずっと気圧が低い。体がだる重い感じがする。',
      },
    ],
  },
];

const SEVERITY_ICONS = ['😊', '😐', '😫', '🤮'];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>記録履歴</Text>
        <Pressable style={styles.helpButton}>
          <Text style={styles.helpIcon}>❓</Text>
        </Pressable>
      </View>

      {/* フィルタータブ */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          <Pressable style={[styles.filterTab, styles.filterTabActive]}>
            <Text style={[styles.filterTabText, styles.filterTabTextActive]}>週間</Text>
          </Pressable>
          <Pressable style={styles.filterTab}>
            <Text style={styles.filterTabText}>月間</Text>
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
              <Text style={styles.correlationValue}>85%</Text>
              <View style={styles.correlationTrend}>
                <Text style={styles.trendIcon}>📈</Text>
                <Text style={styles.trendText}>非常に関連が強い</Text>
              </View>
            </View>
            <View style={styles.correlationCard}>
              <Text style={styles.correlationLabel}>主なトリガー</Text>
              <Text style={styles.triggerValue}>爆弾低気圧</Text>
              <Text style={styles.triggerNote}>1010hPa以下で発生</Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              記録の多くが急激な気圧低下時に発生しています。気圧の変化に非常に敏感なタイプかもしれません。
            </Text>
          </View>
        </View>

        {/* タイムライン */}
        {MOCK_LOGS.map((dayLog) => (
          <View key={dayLog.id}>
            <Text style={styles.dateLabel}>{dayLog.date}</Text>
            <View style={styles.timeline}>
              {dayLog.records.map((record, index) => (
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
                        {record.severity >= 3 ? '⚡' : record.severity >= 2 ? '⚠️' : '😐'}
                      </Text>
                    </View>
                    {index < dayLog.records.length - 1 && (
                      <View style={styles.timelineConnector} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <View>
                        <Text style={styles.timeText}>{record.time}</Text>
                        <Text style={styles.severityLabel}>{record.label}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          record.pressureStatus === 'danger' && styles.statusBadgeDanger,
                          record.pressureStatus === 'stable' && styles.statusBadgeStable,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {record.pressureStatus === 'danger'
                            ? '急降下'
                            : record.pressureStatus === 'caution'
                              ? '低気圧'
                              : '安定'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.recordCard}>
                      <View style={styles.pressureRow}>
                        <Text style={styles.pressureIcon}>📊</Text>
                        <Text style={styles.pressureText}>{record.pressure} hPa</Text>
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
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab}>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.primary,
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
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.1)',
  },
  insightText: {
    fontSize: fontSize.xs,
    color: colors.textMain,
    lineHeight: 18,
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
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
    borderColor: 'rgba(100, 181, 246, 0.2)',
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
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(100, 181, 246, 0.2)',
  },
  statusBadgeDanger: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  statusBadgeStable: {
    backgroundColor: colors.bgSoft,
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
