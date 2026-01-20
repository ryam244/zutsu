import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, layout } from '@/theme';

type TabIconProps = {
  name: string;
  focused: boolean;
};

function TabIcon({ name, focused }: TabIconProps) {
  // Material Symbols は expo-vector-icons で使用するか、
  // カスタムアイコンコンポーネントで実装
  // 今回はプレースホルダーとしてテキストで表示
  const iconMap: Record<string, string> = {
    home: '🏠',
    history: '📋',
    bar_chart: '📊',
    settings: '⚙️',
  };

  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {iconMap[name] || '●'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarIcon: ({ focused }) => <TabIcon name="history" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: '分析',
          tabBarIcon: ({ focused }) => <TabIcon name="bar_chart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surfaceGlass,
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    height: layout.bottomNavHeightWithSafe,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  icon: {
    fontSize: 24,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
