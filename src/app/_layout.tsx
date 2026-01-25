import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { signInAnonymouslyUser, subscribeToAuthState } from '@/services/firebase';
import { useAppStore } from '@/stores/appStore';
import { useNotifications } from '@/hooks/useNotifications';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useAppStore((state) => state.setUser);

  // 通知の初期化
  useNotifications();

  useEffect(() => {
    // 認証状態を監視
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        // ログイン済み
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          isAnonymous: firebaseUser.isAnonymous,
        });
        setIsLoading(false);
      } else {
        // 未ログイン → 匿名認証を実行
        const user = await signInAnonymouslyUser();
        if (user) {
          setUser({
            id: user.uid,
            email: user.email,
            isAnonymous: user.isAnonymous,
          });
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.bgMain} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgMain },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgMain,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSub,
    fontSize: 14,
  },
});
