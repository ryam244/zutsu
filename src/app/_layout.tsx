import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/theme';

// スプラッシュスクリーンを自動で非表示にしない
SplashScreen.preventAutoHideAsync();

// エラーフォールバックコンポーネント
function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>エラーが発生しました</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
    </View>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // ここで必要な初期化処理を行う
        // 例: フォント読み込み、初期データ取得など
        // 最低限の待機時間を設けて、UIが安定するのを待つ
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('App initialization error:', e);
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // アプリが準備完了したらスプラッシュスクリーンを非表示
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    // スプラッシュスクリーンが表示されている間は何も描画しない
    return null;
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <ErrorFallback error={error} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar style="dark" backgroundColor={colors.bgMain} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgMain },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.bgMain,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dangerText,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
  },
});
