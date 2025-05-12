import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Pdf from 'react-native-pdf';
import Overlay from '../common/Overlay';

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

  // PDF 뷰어 설정
  const { pdfViewerOptions, updatePDFViewerOptions } = useViewerSettings();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    pdfRef.current?.setPage(page);
  };

  // 설정에 따른 PDF 속성 계산
  const pdfHorizontal = pdfViewerOptions.viewMode === 'page';
  const pdfSpacing = pdfViewerOptions.pageSpacing;
  const pdfEnablePaging = pdfViewerOptions.viewMode === 'page';

  // SectionList 데이터 구조 정의
  const sections: SettingsSection[] = [
    {
      title: '뷰어 모드',
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
      ],
    },
    {
      title: '페이지 설정',
      data: [
        {
          key: 'pageSpacing',
          type: 'slider',
          value: pdfViewerOptions.pageSpacing,
          label: '페이지 간격',
          min: 0,
          max: 20,
          step: 1,
          unit: 'px',
        },
        {
          key: 'showPageNumbers',
          type: 'switch',
          value: pdfViewerOptions.showPageNumbers,
          label: '페이지 번호 표시',
        },
      ],
    },
    {
      title: '성능 설정',
      data: [
        {
          key: 'enableCache',
          type: 'switch',
          value: pdfViewerOptions.enableCache,
          label: '캐시 사용',
        },
        {
          key: 'enableDoubleTapZoom',
          type: 'switch',
          value: pdfViewerOptions.enableDoubleTapZoom,
          label: '더블 탭 확대/축소',
        },
      ],
    },
    {
      title: '화면 표시 설정',
      data: [
        {
          key: 'showLoadingIndicator',
          type: 'switch',
          value: pdfViewerOptions.showLoadingIndicator,
          label: '로딩 표시',
        },
        {
          key: 'showThumbnails',
          type: 'switch',
          value: pdfViewerOptions.showThumbnails,
          label: '썸네일 표시',
        },
      ],
    },
    {
      title: '기타 설정',
      data: [
        {
          key: 'enableRTL',
          type: 'switch',
          value: pdfViewerOptions.enableRTL,
          label: 'RTL 방향 (오른쪽에서 왼쪽)',
        },
      ],
    },
  ];

  const handleOptionChange = (key: string, value: any) => {
    updatePDFViewerOptions({ [key]: value });
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={[styles.container, { backgroundColor: 'black' }]}>
          <Pdf
            ref={pdfRef}
            source={{ uri }}
            style={styles.pdf}
            enablePaging={pdfEnablePaging}
            horizontal={pdfHorizontal}
            spacing={pdfSpacing}
            onPageChanged={(page, numberOfPages) => {
              setCurrentPage(page);
              setTotalPages(numberOfPages);
            }}
            onLoadComplete={(numberOfPages) => setTotalPages(numberOfPages)}
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

      {/* 설정 바텀 시트 */}
      <SettingsBottomSheet
        title="PDF 설정"
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
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});
