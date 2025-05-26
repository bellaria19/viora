import { Overlay, SettingsBottomSheet } from '@/components/common';
import { SettingsSection } from '@/components/common/SettingsBottomSheet';
import ViewerError from '@/components/viewers/ViewerError';
import ViewerLoading from '@/components/viewers/ViewerLoading';
import { BACKGROUND_COLOR_OPTIONS, FONTS, TEXT_COLOR_OPTIONS } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { Reader, ReaderProvider, Themes, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          options: FONTS.map((f) => ({ value: f.value, label: f.label })),
        },
        {
          key: 'fontSize',
          type: 'stepper',
          value: epubViewerOptions.fontSize,
          label: '글자 크기',
          min: 12,
          max: 32,
          step: 2,
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
          key: 'textColor',
          type: 'color-group',
          value: epubViewerOptions.textColor,
          label: '글자 색상',
          colorOptions: TEXT_COLOR_OPTIONS,
        },
        {
          key: 'backgroundColor',
          type: 'color-group',
          value: epubViewerOptions.backgroundColor,
          label: '배경 색상',
          colorOptions: BACKGROUND_COLOR_OPTIONS,
        },
        {
          key: 'fontWeight',
          type: 'stepper',
          value: parseInt((epubViewerOptions.fontWeight || '400').toString(), 10) / 100,
          label: '글자 두께(1~9)',
          min: 1,
          max: 9,
          step: 1,
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
          min: 0,
          max: 40,
          step: 2,
          unit: 'px',
        },
        {
          key: 'marginVertical',
          type: 'stepper',
          value: epubViewerOptions.marginVertical,
          label: '세로 여백',
          min: 0,
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
          style={{ flex: 1, backgroundColor: epubViewerOptions.backgroundColor }}
          onPress={() => setOverlayVisible(true)}
        >
          {isLoading && <ViewerLoading message="EPUB 파일을 불러오는 중..." />}

          <Reader
            src={uri}
            width={width}
            height={height * 0.9}
            fileSystem={useFileSystem}
            flow={epubViewerOptions.viewMode === 'scroll' ? 'scrolled' : 'paginated'}
            defaultTheme={Themes.LIGHT}
            onReady={(locations) => {
              setIsLoading(false);
              if (typeof locations === 'object' && locations !== null && 'total' in locations) {
                setTotalPages((locations as any).total);
              } else {
                setTotalPages(locations);
              }
              // --- 전체 정보 출력 ---
              const readerProps = {
                src: uri,
                width,
                height: height * 0.9,
                fileSystem: useFileSystem,
                flow: epubViewerOptions.viewMode === 'scroll' ? 'scrolled' : 'paginated',
                defaultTheme: Themes.LIGHT,
              };
              console.log('========== EPUB 파일 정보 ==========');
              console.log('locations:', JSON.stringify(locations, null, 2));
              console.log('========== EPUB 뷰어 전체 정보 ==========');
              console.log('epubViewerOptions:', JSON.stringify(epubViewerOptions, null, 2));
              console.log('readerProps:', JSON.stringify(readerProps, null, 2));
              console.log('theme:', theme);
              console.log('goToLocation:', typeof goToLocation);
              console.log('width:', width, 'height:', height);
              console.log('====================================');
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
