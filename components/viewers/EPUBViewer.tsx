import { getEpubSections } from '@/app/settings/sections/epubSections';
import { Overlay, SettingsBottomSheet } from '@/components/common';
import ViewerError from '@/components/viewers/ViewerError';
import ViewerLoading from '@/components/viewers/ViewerLoading';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { Reader, ReaderProvider, Themes, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
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

  const sections = useMemo(() => getEpubSections(epubViewerOptions), [epubViewerOptions]);

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
