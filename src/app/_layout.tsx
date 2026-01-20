import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/theme';

export default function RootLayout() {
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
