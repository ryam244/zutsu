/**
 * 気象データ取得フック
 */

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { fetchWeatherData, generateAlertMessage, generateAdvice } from '@/services/weather';

export const useWeather = () => {
  const weather = useAppStore((state) => state.weather);
  const setWeather = useAppStore((state) => state.setWeather);
  const isLoading = useAppStore((state) => state.isLoadingWeather);
  const setIsLoading = useAppStore((state) => state.setIsLoadingWeather);
  const settings = useAppStore((state) => state.settings);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchWeatherData(
        settings.location.prefecture,
        settings.location.city
      );
      if (data) {
        setWeather(data);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [settings.location.prefecture, settings.location.city, setWeather, setIsLoading]);

  // 初回読み込みと地域変更時に取得
  useEffect(() => {
    if (!weather) {
      refresh();
    }
  }, [weather, refresh]);

  // 地域が変わったら再取得
  useEffect(() => {
    refresh();
  }, [settings.location.prefecture, settings.location.city]);

  // アラートメッセージ
  const alertMessage = weather ? generateAlertMessage(weather) : null;
  const advice = weather ? generateAdvice(weather) : null;

  return {
    weather,
    isLoading,
    refresh,
    alertMessage,
    advice,
  };
};
