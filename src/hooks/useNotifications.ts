/**
 * 通知管理フック
 * 通知の権限リクエストとリスナー設定を管理
 */

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  getExpoPushToken,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  sendPressureAlert,
  scheduleMedicationReminder,
  cancelAllMedicationReminders,
} from '@/services/notifications';
import { useAppStore } from '@/stores/appStore';

export const useNotifications = () => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const settings = useAppStore((state) => state.settings);

  // 初期化
  useEffect(() => {
    const initialize = async () => {
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);

      if (granted) {
        const token = await getExpoPushToken();
        setPushToken(token);
      }
    };

    initialize();

    // 通知受信リスナー
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('通知受信:', notification);
    });

    // 通知タップリスナー
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log('通知タップ:', response);
      const data = response.notification.request.content.data;

      // 通知タイプに応じた処理
      if (data?.type === 'pressure_alert') {
        // ホーム画面に遷移（必要に応じて実装）
      } else if (data?.type === 'medication_reminder') {
        // 服薬記録画面に遷移（必要に応じて実装）
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // 服薬リマインダーの設定を監視
  useEffect(() => {
    const setupMedicationReminders = async () => {
      if (!permissionGranted) return;

      if (settings.medication.reminderEnabled && settings.medication.schedule.length > 0) {
        // 最初のスケジュールのみ設定（簡易版）
        const firstSchedule = settings.medication.schedule[0];
        const [hour, minute] = firstSchedule.split(':').map(Number);
        await scheduleMedicationReminder(hour, minute);
      } else {
        await cancelAllMedicationReminders();
      }
    };

    setupMedicationReminders();
  }, [settings.medication, permissionGranted]);

  // 気圧アラートを送信
  const triggerPressureAlert = async (
    pressure: number,
    change: number,
    severity: 'danger' | 'caution'
  ) => {
    if (!permissionGranted) return;

    // 設定に基づいてアラートを送信
    if (severity === 'danger' && settings.notifications.pressureAlert) {
      await sendPressureAlert(pressure, change, severity);
    } else if (severity === 'caution' && settings.notifications.cautionAlert) {
      await sendPressureAlert(pressure, change, severity);
    }
  };

  return {
    pushToken,
    permissionGranted,
    triggerPressureAlert,
  };
};
