import Overlay from '@/components/common/Overlay';
import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PDFViewerProps {
  uri: string;
}

export default function PDFViewer({ uri }: PDFViewerProps) {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const pdfRef = useRef<any>(null);
  const navigation = useNavigation();
  const { pdfViewerOptions, updatePDFViewerOptions } = useViewerSettings();

  // 최근 본 페이지 복원
  useEffect(() => {
    if (pdfViewerOptions.lastPage && pdfViewerOptions.lastPage > 0) {
      setCurrentPage(pdfViewerOptions.lastPage);
    }
  }, [pdfViewerOptions.lastPage]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      pdfRef.current?.setPage(page);
      updatePDFViewerOptions({ lastPage: page });
    },
    [updatePDFViewerOptions],
  );

  // PDF 로드 완료 시 최근 페이지로 이동
  const handleLoadComplete = useCallback(
    (numberOfPages: number) => {
      setTotalPages(numberOfPages);
      if (pdfRef.current && currentPage > 1) {
        pdfRef.current.setPage(currentPage);
      }
    },
    [currentPage],
  );

  // 옵션 변경 핸들러 useCallback
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updatePDFViewerOptions({ [key]: value });
    },
    [updatePDFViewerOptions],
  );

  // PDF 뷰어 옵션
  const pdfHorizontal = useMemo(
    () => pdfViewerOptions.viewMode === 'page',
    [pdfViewerOptions.viewMode],
  );
  const pdfEnablePaging = pdfHorizontal;

  // 설정 섹션
  const sections: SettingsSection[] = useMemo(
    () => [
      {
        title: '뷰어 설정',
        data: [
          {
            key: 'viewMode',
            type: 'button-group',
            value: pdfViewerOptions.viewMode,
            label: '뷰어 모드',
            options: [
              { value: 'page', label: '페이지', icon: 'file' },
              { value: 'scroll', label: '스크롤', icon: 'scroll' },
            ],
          },
          {
            key: 'enableRTL',
            type: 'switch',
            value: pdfViewerOptions.enableRTL,
            label: 'RTL 방향 (오른쪽→왼쪽)',
          },
        ],
      },
      {
        title: '표시 설정',
        data: [
          {
            key: 'backgroundColor',
            type: 'color-group',
            value: pdfViewerOptions.backgroundColor,
            label: '배경 색상',
            colorOptions: ['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent'],
          },
        ],
      },
      {
        title: '성능 설정',
        data: [
          {
            key: 'enableDoubleTapZoom',
            type: 'switch',
            value: pdfViewerOptions.enableDoubleTapZoom,
            label: '더블 탭 확대/축소',
          },
          {
            key: 'enableCache',
            type: 'switch',
            value: pdfViewerOptions.enableCache,
            label: '캐시 사용',
          },
        ],
      },
    ],
    [pdfViewerOptions],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={{ flex: 1 }}>
          <Pdf
            ref={pdfRef}
            source={{ uri }}
            style={{ flex: 1, backgroundColor: pdfViewerOptions.backgroundColor }}
            enablePaging={pdfEnablePaging}
            horizontal={pdfHorizontal}
            onPageChanged={(page, numberOfPages) => {
              setCurrentPage(page);
              setTotalPages(numberOfPages);
              updatePDFViewerOptions({ lastPage: page });
            }}
            onLoadComplete={handleLoadComplete}
            enableRTL={pdfViewerOptions.enableRTL}
            enableDoubleTapZoom={pdfViewerOptions.enableDoubleTapZoom}
          />
          <Overlay
            visible={overlayVisible}
            onBack={() => navigation.goBack()}
            onSettings={() => setSettingsVisible(true)}
            showSlider={totalPages > 1}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </View>
      </TouchableWithoutFeedback>
      <SettingsBottomSheet
        title="PDF 설정"
        isVisible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        sections={sections}
        onOptionChange={handleOptionChange}
      />
    </SafeAreaView>
  );
}
