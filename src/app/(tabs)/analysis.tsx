import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/theme';

export default function AnalysisScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>分析</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📊</Text>
          <Text style={styles.placeholderTitle}>分析機能</Text>
          <Text style={styles.placeholderText}>
            Phase 2 で実装予定
          </Text>
          <Text style={styles.placeholderSubtext}>
            記録データが蓄積されると、詳細な分析が可能になります
          </Text>
        </View>

        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>今後追加予定の機能</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureText}>気圧変動パターンの分析</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>トリガーの自動検出</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>月別・季節別の傾向</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏥</Text>
            <Text style={styles.featureText}>医療機関向けレポート出力</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: colors.surfaceGlass,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['3xl'],
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.xl,
  },
  placeholderTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  placeholderSubtext: {
    fontSize: fontSize.xs,
    color: colors.textSub,
    textAlign: 'center',
  },
  featureList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSub,
    marginBottom: spacing.xl,
    letterSpacing: 0.5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: fontSize.base,
    color: colors.textMain,
  },
});
