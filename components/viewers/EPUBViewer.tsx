import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import ViewerError from '@/components/viewers/ViewerError';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { Reader, ReaderProvider, Themes, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Overlay from '../common/Overlay';

type Location = {
  start?: { displayed?: { page?: number }; cfi?: string };
  end?: { displayed?: { page?: number }; cfi?: string };
};

interface EPUBViewerProps {
  uri: string;
}

export default function EPUBViewer({ uri }: EPUBViewerProps) {
  const { width, height } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const { theme, goToLocation } = useReader();

  // EPUB 뷰어 설정
  const { epubViewerOptions, updateEPUBViewerOptions } = useViewerSettings();

  // 테마 및 색상 적용 함수
  const getBackgroundColor = () => {
    // 사용자 지정 배경색 우선, 없으면 테마별 기본값
    if (epubViewerOptions.backgroundColor) return epubViewerOptions.backgroundColor;
    switch (epubViewerOptions.theme) {
      case 'dark':
        return '#1a1a1a';
      case 'sepia':
        return '#f8f1e3';
      default:
        return '#ffffff';
    }
  };

  const getTextColor = () => {
    if (epubViewerOptions.textColor) return epubViewerOptions.textColor;
    switch (epubViewerOptions.theme) {
      case 'dark':
        return '#eee';
      case 'sepia':
        return '#5b4636';
      default:
        return '#333';
    }
  };

  // 설정 섹션 데이터 (epub.tsx와 동일하게 통일)
  const sections: SettingsSection[] = [
    {
      title: '뷰어 설정',
      data: [
        {
          key: 'viewMode',
          type: 'button-group',
          value: epubViewerOptions.viewMode,
          label: '뷰어 모드',
          options: [
            { value: 'page', label: '페이지', icon: 'file' },
            { value: 'scroll', label: '스크롤', icon: 'scroll' },
          ],
        },
        {
          key: 'enableRTL',
          type: 'switch',
          value: epubViewerOptions.enableRTL,
          label: 'RTL 방향 (오른쪽→왼쪽)',
        },
      ],
    },
    {
      title: '글꼴 설정',
      data: [
        {
          key: 'fontFamily',
          type: 'button-group',
          value: epubViewerOptions.fontFamily,
          label: '글꼴',
          options: [
            { value: 'System', label: '시스템' },
            { value: 'SpaceMono', label: '스페이스 모노' },
            { value: 'Arial', label: '아리알' },
            { value: 'Georgia', label: '조지아' },
          ],
        },
        {
          key: 'fontSize',
          type: 'stepper',
          value: epubViewerOptions.fontSize,
          label: '글자 크기',
          min: 12,
          max: 32,
          step: 1,
          unit: 'px',
        },
        {
          key: 'lineHeight',
          type: 'stepper',
          value: epubViewerOptions.lineHeight,
          label: '줄 간격',
          min: 1.0,
          max: 2.5,
          step: 0.1,
        },
      ],
    },
    {
      title: '표시 설정',
      data: [
        {
          key: 'theme',
          type: 'button-group',
          value: epubViewerOptions.theme,
          label: '테마',
          options: [
            { value: 'light', label: '라이트' },
            { value: 'dark', label: '다크' },
            { value: 'sepia', label: '세피아' },
          ],
        },
        {
          key: 'textColor',
          type: 'color-group',
          value: epubViewerOptions.textColor,
          label: '글자 색상',
          colorOptions: ['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent'],
        },
        {
          key: 'backgroundColor',
          type: 'color-group',
          value: epubViewerOptions.backgroundColor,
          label: '배경 색상',
          colorOptions: ['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent'],
        },
        {
          key: 'linkColor',
          type: 'color-group',
          value: epubViewerOptions.linkColor,
          label: '링크 색상',
          colorOptions: ['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent'],
        },
      ],
    },
    {
      title: '여백 설정',
      data: [
        {
          key: 'marginHorizontal',
          type: 'stepper',
          value: epubViewerOptions.marginHorizontal,
          label: '가로 여백',
          min: 8,
          max: 40,
          step: 2,
          unit: 'px',
        },
        {
          key: 'marginVertical',
          type: 'stepper',
          value: epubViewerOptions.marginVertical,
          label: '세로 여백',
          min: 8,
          max: 40,
          step: 2,
          unit: 'px',
        },
      ],
    },
  ];

  // 설정 변경 핸들러
  const handleOptionChange = (key: string, value: any) => {
    updateEPUBViewerOptions({ [key]: value });
  };

  // 오류 상태 처리
  if (error) {
    return <ViewerError message={`EPUB 파일을 불러오는 중 오류가 발생했습니다: ${error}`} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ReaderProvider>
        <Pressable
          style={[styles.container, { backgroundColor: getBackgroundColor() }]}
          onPress={() => setOverlayVisible(true)}
        >
          {isLoading && (
            <View style={[styles.loadingContainer, { backgroundColor: getBackgroundColor() }]}>
              <ActivityIndicator size="large" color={getTextColor()} />
              <Text style={[styles.loadingText, { color: getTextColor() }]}>
                EPUB 파일을 불러오는 중...
              </Text>
            </View>
          )}

          <Reader
            src={uri}
            width={width}
            height={height * 0.9}
            fileSystem={useFileSystem}
            flow={epubViewerOptions.viewMode === 'scroll' ? 'scrolled' : 'paginated'}
            defaultTheme={Themes.LIGHT}
            onReady={(locations) => {
              console.log('EPUB locations:', locations);
              setIsLoading(false);
              if (typeof locations === 'object' && locations !== null && 'total' in locations) {
                setTotalPages((locations as any).total);
              } else {
                setTotalPages(locations);
              }
            }}
            onLocationChange={(_locations, location) => {
              console.log('EPUB location:', location);
              setCurrentPage(location?.start?.displayed?.page || 1);
            }}
          />

          <Overlay
            visible={overlayVisible}
            onBack={() => navigation.goBack()}
            onSettings={() => setSettingsVisible(true)}
            showSlider={totalPages > 1}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              if (goToLocation) {
                goToLocation(page.toString());
              }
            }}
          />
        </Pressable>

        <SettingsBottomSheet
          title="EPUB 설정"
          isVisible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          sections={sections}
          onOptionChange={handleOptionChange}
        />
      </ReaderProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
