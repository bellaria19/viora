import { FontAwesome6 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '최근 파일',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="clock-rotate-left" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: '모든 파일',
          tabBarIcon: ({ color, size }) => <FontAwesome6 name="folder" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => <FontAwesome6 name="gear" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
