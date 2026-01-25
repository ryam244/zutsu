/**
 * プッシュ通知サービス
 * expo-notifications を使用した通知管理
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 通知の表示設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 通知の種類
export type NotificationType = 'pressure_alert' | 'caution_alert' | 'medication_reminder';

interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * 通知権限をリクエスト
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('通知はシミュレーターでは利用できません');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('通知権限が許可されませんでした');
    return false;
  }

  // Android用のチャンネル設定
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pressure-alerts', {
      name: '気圧アラート',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#30abe8',
    });

    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name: '服薬リマインダー',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
};

/**
 * Expoプッシュトークンを取得
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token.data;
  } catch (error) {
    console.error('プッシュトークン取得エラー:', error);
    return null;
  }
};

/**
 * 即時通知を送信（ローカル）
 */
export const sendLocalNotification = async (
  type: NotificationType,
  content: NotificationContent
): Promise<string> => {
  const channelId = type === 'medication_reminder' ? 'medication-reminders' : 'pressure-alerts';

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      data: { type, ...content.data },
      ...(Platform.OS === 'android' && { channelId }),
    },
    trigger: null, // 即時送信
  });
};

/**
 * 気圧警戒通知を送信
 */
export const sendPressureAlert = async (
  pressure: number,
  change: number,
  severity: 'danger' | 'caution'
): Promise<string> => {
  const isSevere = severity === 'danger';

  return await sendLocalNotification('pressure_alert', {
    title: isSevere ? '⚠️ 気圧警戒アラート' : '⚡ 気圧注意報',
    body: isSevere
      ? `気圧が急激に変化しています（${pressure}hPa, ${change > 0 ? '+' : ''}${change}hPa）。頭痛に備えてください。`
      : `気圧が低下傾向です（${pressure}hPa）。体調に注意してください。`,
    data: { pressure, change, severity },
  });
};

/**
 * 服薬リマインダーをスケジュール
 */
export const scheduleMedicationReminder = async (
  hour: number,
  minute: number
): Promise<string> => {
  // 既存のリマインダーをキャンセル
  await cancelAllMedicationReminders();

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: '💊 服薬リマインダー',
      body: 'お薬の時間です',
      data: { type: 'medication_reminder' },
      ...(Platform.OS === 'android' && { channelId: 'medication-reminders' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

/**
 * 服薬リマインダーをすべてキャンセル
 */
export const cancelAllMedicationReminders = async (): Promise<void> => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of notifications) {
    if (notification.content.data?.type === 'medication_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

/**
 * すべての通知をキャンセル
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * 通知リスナーを設定
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * 通知タップリスナーを設定
 */
export const addNotificationResponseReceivedListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
