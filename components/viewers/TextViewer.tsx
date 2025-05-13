import Overlay from '@/components/common/Overlay';
import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { FONTS, THEMES } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface TextViewerProps {
  uri: string;
}

export default function TextViewer({ uri }: TextViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const navigation = useNavigation();
  const { textViewerOptions, updateTextViewerOptions } = useViewerSettings();

  // 텍스트 파일 불러오기
  // UTF-8만 지원
  const loadTextContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo || !fileInfo.exists) {
        throw new Error('파일이 존재하지 않습니다.');
      }
      const text = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setContent(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [uri]);

  useEffect(() => {
    loadTextContent();
  }, [loadTextContent]);

  // 테마 스타일 useMemo로 최적화
  const themeStyles = useMemo(() => {
    const theme = THEMES.find((t) => t.value === textViewerOptions.theme);
    if (theme) {
      return { backgroundColor: theme.bgColor, textColor: theme.textColor };
    }
    return {
      backgroundColor: textViewerOptions.backgroundColor,
      textColor: textViewerOptions.textColor,
    };
  }, [textViewerOptions]);

  // 설정 섹션 useMemo로 최적화
  const sections: SettingsSection[] = useMemo(
    () => [
      {
        title: '테마',
        data: [
          {
            key: 'theme',
            type: 'button-group',
            value: textViewerOptions.theme,
            label: '테마',
            options: THEMES.map((t) => ({ value: t.value, label: t.label })),
          },
        ],
      },
      {
        title: '글꼴',
        data: [
          {
            key: 'fontFamily',
            type: 'button-group',
            value: textViewerOptions.fontFamily,
            label: '글꼴',
            options: FONTS.map((f) => ({ value: f.value, label: f.label })),
          },
        ],
      },
      {
        title: '글자 크기',
        data: [
          {
            key: 'fontSize',
            type: 'slider',
            value: textViewerOptions.fontSize,
            label: '글자 크기',
            min: 12,
            max: 28,
            step: 1,
            unit: 'px',
          },
        ],
      },
      {
        title: '줄 간격',
        data: [
          {
            key: 'lineHeight',
            type: 'slider',
            value: textViewerOptions.lineHeight,
            label: '줄 간격',
            min: 1.0,
            max: 2.5,
            step: 0.1,
          },
        ],
      },
      {
        title: '여백',
        data: [
          {
            key: 'marginHorizontal',
            type: 'slider',
            value: textViewerOptions.marginHorizontal,
            label: '여백',
            min: 8,
            max: 40,
            step: 2,
            unit: 'px',
          },
        ],
      },
    ],
    [textViewerOptions],
  );

  // 옵션 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      if (key === 'theme') {
        const themeObj = THEMES.find((t) => t.value === value);
        updateTextViewerOptions({
          theme: value,
          backgroundColor: themeObj?.bgColor,
          textColor: themeObj?.textColor,
        });
      } else if (key === 'marginHorizontal') {
        updateTextViewerOptions({ marginHorizontal: value, marginVertical: value });
      } else {
        updateTextViewerOptions({ [key]: value });
      }
    },
    [updateTextViewerOptions],
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeStyles.backgroundColor }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={[styles.statusText, { color: themeStyles.textColor }]}>
          텍스트 파일을 불러오는 중...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeStyles.backgroundColor }]}>
        <Text style={[styles.statusText, { color: themeStyles.textColor, marginBottom: 20 }]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTextContent}>
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: '#757575', marginTop: 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
          <ScrollView
            style={[
              styles.scrollView,
              {
                paddingHorizontal: textViewerOptions.marginHorizontal,
                paddingVertical: textViewerOptions.marginVertical,
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  fontFamily: textViewerOptions.fontFamily,
                  fontSize: textViewerOptions.fontSize,
                  lineHeight: textViewerOptions.fontSize * textViewerOptions.lineHeight,
                  color: themeStyles.textColor,
                },
              ]}
            >
              {content}
            </Text>
          </ScrollView>
          <Overlay
            visible={overlayVisible}
            onBack={() => navigation.goBack()}
            onSettings={() => setSettingsVisible(true)}
          />
        </View>
      </TouchableWithoutFeedback>
      <SettingsBottomSheet
        title="텍스트 설정"
        isVisible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        sections={sections}
        onOptionChange={handleOptionChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  quickEncodingSelector: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  quickEncodingButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 4,
    width: '100%',
  },
  quickEncodingButtonSelected: {
    backgroundColor: '#2196F3',
  },
  quickEncodingText: {
    color: '#fff',
    fontSize: 14,
  },
  quickEncodingTextSelected: {
    fontWeight: 'bold',
  },
});
