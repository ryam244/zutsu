/**
 * Zutsu-Log アプリケーションストア
 * Zustand を使用した状態管理
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, HealthLog, WeatherData, AppSettings, SeverityLevel } from '@/types';

interface AppState {
  // ユーザー
  user: User | null;
  setUser: (user: User | null) => void;

  // 気象データ
  weather: WeatherData | null;
  setWeather: (weather: WeatherData | null) => void;
  isLoadingWeather: boolean;
  setIsLoadingWeather: (loading: boolean) => void;

  // 体調記録
  healthLogs: HealthLog[];
  addHealthLog: (log: HealthLog) => void;
  setHealthLogs: (logs: HealthLog[]) => void;

  // 設定
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateNotificationSettings: (settings: Partial<AppSettings['notifications']>) => void;
  updateMedicationSettings: (settings: Partial<AppSettings['medication']>) => void;

  // UI状態
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  location: {
    prefecture: '東京都',
    city: '千代田区',
  },
  notifications: {
    pressureAlert: true,
    cautionAlert: false,
    sensitivity: 'normal',
  },
  medication: {
    reminderEnabled: false,
    schedule: ['08:00', '20:00'],
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ユーザー
      user: null,
      setUser: (user) => set({ user }),

      // 気象データ
      weather: null,
      setWeather: (weather) => set({ weather }),
      isLoadingWeather: false,
      setIsLoadingWeather: (loading) => set({ isLoadingWeather: loading }),

      // 体調記録
      healthLogs: [],
      addHealthLog: (log) =>
        set((state) => ({
          healthLogs: [log, ...state.healthLogs],
        })),
      setHealthLogs: (logs) => set({ healthLogs: logs }),

      // 設定
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      updateNotificationSettings: (notificationSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...notificationSettings },
          },
        })),
      updateMedicationSettings: (medicationSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            medication: { ...state.settings.medication, ...medicationSettings },
          },
        })),

      // UI状態
      isRecording: false,
      setIsRecording: (recording) => set({ isRecording: recording }),
    }),
    {
      name: 'zutsu-log-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        healthLogs: state.healthLogs,
        settings: state.settings,
      }),
    }
  )
);

// セレクター（パフォーマンス最適化用）
export const useUser = () => useAppStore((state) => state.user);
export const useWeather = () => useAppStore((state) => state.weather);
export const useHealthLogs = () => useAppStore((state) => state.healthLogs);
export const useSettings = () => useAppStore((state) => state.settings);
export const useLocation = () => useAppStore((state) => state.settings.location);
