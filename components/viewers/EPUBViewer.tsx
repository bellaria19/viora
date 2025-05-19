import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import ViewerError from '@/components/viewers/ViewerError';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { Reader, ReaderProvider, Section, Themes, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  const epubRef = useRef<any>(null);
  const navigation = useNavigation();
  const { theme } = useReader();

  // EPUB 뷰어 설정
  const { epubViewerOptions, updateEPUBViewerOptions } = useViewerSettings();

  // 테마 색상
  const getBackgroundColor = () => {
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
    switch (epubViewerOptions.theme) {
      case 'dark':
        return '#eee';
      case 'sepia':
        return '#5b4636';
      default:
        return '#333';
    }
  };

  // 설정 섹션 데이터
  const sections: SettingsSection[] = [
    {
      title: '뷰어 모드',
      data: [
        {
          key: 'viewMode',
          type: 'button-group',
          value: epubViewerOptions.viewMode,
          options: [
            { value: 'page', label: '페이지', icon: 'file' },
            { value: 'scroll', label: '스크롤', icon: 'scroll' },
          ],
        },
      ],
    },
    {
      title: '테마',
      data: [
        {
          key: 'theme',
          type: 'button-group',
          value: epubViewerOptions.theme,
          options: [
            { value: 'light', label: '라이트' },
            { value: 'dark', label: '다크' },
            { value: 'sepia', label: '세피아' },
          ],
        },
      ],
    },
    {
      title: '글꼴',
      data: [
        {
          key: 'fontFamily',
          type: 'button-group',
          value: epubViewerOptions.fontFamily,
          options: [
            { value: 'System', label: '시스템' },
            { value: 'SpaceMono', label: '스페이스 모노' },
            { value: 'Arial', label: '아리알' },
            { value: 'Georgia', label: '조지아' },
          ],
        },
      ],
    },
    {
      title: '글자 크기',
      data: [
        {
          key: 'fontSize',
          type: 'slider',
          value: epubViewerOptions.fontSize,
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
          value: epubViewerOptions.lineHeight,
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
          value: epubViewerOptions.marginHorizontal,
          label: '가로 여백',
          min: 8,
          max: 40,
          step: 2,
          unit: 'px',
        },
        {
          key: 'marginVertical',
          type: 'slider',
          value: epubViewerOptions.marginVertical,
          label: '세로 여백',
          min: 8,
          max: 40,
          step: 2,
          unit: 'px',
        },
      ],
    },
    {
      title: '기능 설정',
      data: [
        {
          key: 'enableRTL',
          type: 'switch',
          value: epubViewerOptions.enableRTL,
          label: 'RTL 방향 (오른쪽→왼쪽)',
        },
        {
          key: 'enableTOC',
          type: 'switch',
          value: epubViewerOptions.enableTOC,
          label: '목차 표시',
        },
        {
          key: 'enableTextSelection',
          type: 'switch',
          value: epubViewerOptions.enableTextSelection,
          label: '텍스트 선택 기능',
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
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
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
            onReady={(totalLocations: number, currentLocation: Location, progress: number) => {
              setIsLoading(false);
              setTotalPages(totalLocations);
            }}
            onLocationChange={(
              totalLocations: number,
              currentLocation: Location,
              progress: number,
              currentSection: Section | null,
            ) => {
              setCurrentPage(currentLocation?.start?.displayed?.page || 1);
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
              // spine index로 이동 (goToLocation 사용)
              if (epubRef.current && epubRef.current.goToLocation) {
                // cfi 또는 spine index로 이동 (여기선 spine index를 cfi로 변환 필요)
                // 예시: 1페이지 -> 'epubcfi(/6/2[chapter1]!/4/2/2/1:0)'
                // 실제 구현에서는 spine 정보를 활용해야 함
                // 임시로 page number만 set
                setCurrentPage(page);
              }
            }}
          />
        </View>

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
