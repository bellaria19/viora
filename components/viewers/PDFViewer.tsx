import { Overlay } from '@/components/common';
import SettingBottomSheet from '@/components/settings/SettingBottomSheet';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { getPdfSections } from '@/utils/sections/pdfSections';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import Pdf from 'react-native-pdf';

interface PDFViewerProps {
  uri: string;
  title?: string;
}

export default function PDFViewer({ uri, title }: PDFViewerProps) {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const pdfRef = useRef<any>(null);
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
  const sections = useMemo(() => getPdfSections(pdfViewerOptions), [pdfViewerOptions]);

  return (
    <View style={{ flex: 1 }}>
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
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
          <Overlay
            title={title}
            visible={overlayVisible}
            onSettings={() => setSettingsVisible(true)}
            showSlider={totalPages > 1}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </View>
      </TouchableWithoutFeedback>
      <SettingBottomSheet
        title="PDF 설정"
        isVisible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        sections={sections}
        onOptionChange={handleOptionChange}
      />
    </View>
  );
}
