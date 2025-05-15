import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="text"
        options={{
          title: '텍스트 뷰어 설정',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="image"
        options={{
          title: '이미지 뷰어 설정',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="pdf"
        options={{
          title: 'PDF 뷰어 설정',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="epub"
        options={{
          title: 'EPUB 뷰어 설정',
        }}
      />
      <Stack.Screen
        name="feedback"
        options={{
          title: '피드백 보내기',
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
