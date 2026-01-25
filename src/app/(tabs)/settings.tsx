import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Modal, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows, layout } from '@/theme';
import { useAppStore } from '@/stores/appStore';

// 外部リンク
const LINKS = {
  privacyPolicy: 'https://ryam.notion.site/2f313c5594368019b07be50135a9fb0b',
  termsOfService: 'https://ryam.notion.site/2f313c55943680e1a6a0e24f1276fdd7',
};

// 都道府県リスト
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

// 感度レベル
const SENSITIVITY_LABELS = {
  low: '低',
  normal: '標準',
  high: '高',
} as const;

export default function SettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const updateNotificationSettings = useAppStore((state) => state.updateNotificationSettings);
  const updateMedicationSettings = useAppStore((state) => state.updateMedicationSettings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // 通知設定の更新
  const handlePressureAlertChange = (value: boolean) => {
    updateNotificationSettings({ pressureAlert: value });
  };

  const handleCautionAlertChange = (value: boolean) => {
    updateNotificationSettings({ cautionAlert: value });
  };

  const handleMedicationReminderChange = (value: boolean) => {
    updateMedicationSettings({ reminderEnabled: value });
  };

  // 感度の切り替え
  const handleSensitivityChange = () => {
    const levels: Array<'low' | 'normal' | 'high'> = ['low', 'normal', 'high'];
    const currentIndex = levels.indexOf(settings.notifications.sensitivity);
    const nextIndex = (currentIndex + 1) % levels.length;
    updateNotificationSettings({ sensitivity: levels[nextIndex] });
  };

  // 地域選択
  const handleSelectPrefecture = (prefecture: string) => {
    updateSettings({
      location: { prefecture, city: '' },
    });
    setShowLocationPicker(false);
  };

  // 感度に応じたスライダー位置
  const getSensitivityPosition = () => {
    switch (settings.notifications.sensitivity) {
      case 'low':
        return '15%';
      case 'normal':
        return '50%';
      case 'high':
        return '85%';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>設定</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* プレミアムバナー */}
        <View style={styles.premiumBanner}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeIcon}>⭐</Text>
              <Text style={styles.premiumBadgeText}>PREMIUM PLAN</Text>
            </View>
            <Text style={styles.premiumTitle}>広告を非表示にする</Text>
            <Text style={styles.premiumDescription}>
              複数地点の登録や詳細な気圧予報をご利用いただけます。
            </Text>
            <Pressable style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>詳細を見る</Text>
            </Pressable>
          </View>
        </View>

        {/* 地域と予報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>地域と予報</Text>
          <View style={styles.sectionContent}>
            <Pressable style={styles.settingItem} onPress={() => setShowLocationPicker(true)}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(96, 165, 250, 0.1)' }]}>
                <Text style={styles.settingIconText}>📍</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>メインの地域</Text>
                <Text style={styles.settingValue}>
                  {settings.location.prefecture} {settings.location.city}
                </Text>
              </View>
              <View style={styles.settingAction}>
                <Text style={styles.settingActionText}>変更</Text>
                <Text style={styles.settingArrow}>›</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* スマート通知 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { marginBottom: 0, paddingHorizontal: 0 }]}>
              スマート通知
            </Text>
            <Text style={styles.sectionInfo}>ℹ️</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(255, 183, 77, 0.1)' }]}>
                <Text style={styles.settingIconText}>🔔</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>2時間前の低下アラート</Text>
                <Text style={styles.settingDescription}>
                  気圧が急激に下がる2時間前にお知らせします。
                </Text>
              </View>
              <Switch
                value={settings.notifications.pressureAlert}
                onValueChange={handlePressureAlertChange}
                trackColor={{ false: colors.bgSoft, true: colors.success }}
                thumbColor={colors.surface}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Text style={styles.settingIconText}>📉</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>注意報アラート</Text>
                <Text style={styles.settingDescription}>
                  気圧が 1005 hPa 以下になった時。
                </Text>
              </View>
              <Switch
                value={settings.notifications.cautionAlert}
                onValueChange={handleCautionAlertChange}
                trackColor={{ false: colors.bgSoft, true: colors.success }}
                thumbColor={colors.surface}
              />
            </View>

            {/* 感度スライダー */}
            <Pressable style={styles.sliderSection} onPress={handleSensitivityChange}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>低下の感度</Text>
                <View style={styles.sliderBadge}>
                  <Text style={styles.sliderBadgeText}>
                    {SENSITIVITY_LABELS[settings.notifications.sensitivity]}
                  </Text>
                </View>
              </View>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: getSensitivityPosition() }]} />
                <View style={[styles.sliderThumb, { left: getSensitivityPosition() }]}>
                  <View style={styles.sliderThumbDot} />
                </View>
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderEndLabel}>大きな変化のみ</Text>
                <Text style={styles.sliderEndLabel}>わずかな変化も</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 服薬管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服薬管理</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(20, 184, 166, 0.1)' }]}>
                <Text style={styles.settingIconText}>💊</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>服薬リマインダー</Text>
                <Text style={styles.settingDescription}>
                  設定した時間に通知します。
                </Text>
              </View>
              <Switch
                value={settings.medication.reminderEnabled}
                onValueChange={handleMedicationReminderChange}
                trackColor={{ false: colors.bgSoft, true: colors.success }}
                thumbColor={colors.surface}
              />
            </View>

            <Pressable style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.settingIconText, { opacity: 0.4 }]}>⏰</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>通知スケジュール</Text>
              </View>
              <View style={styles.settingAction}>
                <Text style={styles.settingActionText}>
                  {settings.medication.schedule.join(', ')}
                </Text>
                <Text style={styles.settingArrow}>›</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* データ管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データ管理</Text>
          <View style={styles.sectionContent}>
            <Pressable style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={styles.settingIconText}>🗑️</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.dangerDark }]}>
                  記録データを削除
                </Text>
                <Text style={styles.settingDescription}>
                  すべての体調記録を削除します
                </Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => Linking.openURL(LINKS.privacyPolicy)}>
              <Text style={styles.footerLink}>プライバシーポリシー</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL(LINKS.termsOfService)}>
              <Text style={styles.footerLink}>利用規約</Text>
            </Pressable>
          </View>
          <Text style={styles.version}>頭痛ログ バージョン 1.0.0</Text>
          <Text style={styles.disclaimer}>
            ※ 本アプリは医学的診断を目的としたものではありません
          </Text>
        </View>
      </ScrollView>

      {/* 地域選択モーダル */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>地域を選択</Text>
              <Pressable onPress={() => setShowLocationPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <FlatList
              data={PREFECTURES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.modalItem,
                    settings.location.prefecture === item && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelectPrefecture(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      settings.location.prefecture === item && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {settings.location.prefecture === item && (
                    <Text style={styles.modalItemCheck}>✓</Text>
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  premiumBanner: {
    margin: spacing.xl,
    backgroundColor: colors.premiumBg,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.1)',
  },
  premiumContent: {
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  premiumBadgeIcon: {
    fontSize: 14,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  premiumTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  premiumDescription: {
    fontSize: fontSize.sm,
    color: colors.textSub,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  premiumButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    ...shadows.primarySm,
  },
  premiumButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.surface,
  },
  section: {
    marginBottom: spacing['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  sectionInfo: {
    fontSize: 14,
    opacity: 0.4,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    gap: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingIcon: {
    width: layout.avatarMd,
    height: layout.avatarMd,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconText: {
    fontSize: 20,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.normal,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  settingValue: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  settingDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingActionText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  settingArrow: {
    fontSize: 20,
    color: colors.textLight,
  },
  sliderSection: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },
  sliderLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  sliderBadge: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  sliderBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.bgSoft,
    borderRadius: borderRadius.full,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: borderRadius.full,
  },
  sliderThumb: {
    position: 'absolute',
    top: '50%',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  sliderThumbDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  sliderEndLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.xl,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: spacing['2xl'],
  },
  footerLink: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  version: {
    fontSize: 11,
    color: colors.textLight,
  },
  disclaimer: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  // モーダル
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  modalClose: {
    fontSize: 20,
    color: colors.textMuted,
    padding: spacing.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalItemSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
  },
  modalItemText: {
    fontSize: fontSize.base,
    color: colors.textMain,
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  modalItemCheck: {
    fontSize: 18,
    color: colors.primary,
  },
});
