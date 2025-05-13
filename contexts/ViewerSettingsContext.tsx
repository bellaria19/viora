import {
  EPUBViewerOptions,
  ImageViewerOptions,
  PDFViewerOptions,
  TextViewerOptions,
} from '@/types/option';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useEffect, useState } from 'react';

// AsyncStorage 키
const TEXT_VIEWER_KEY = 'text_viewer_settings';
const PDF_VIEWER_KEY = 'pdf_viewer_settings';
const IMAGE_VIEWER_KEY = 'image_viewer_settings';
const EPUB_VIEWER_KEY = 'epub_viewer_settings';
const ZIP_VIEWER_KEY = 'zip_viewer_settings';

// ZIP 이미지 뷰어 타입 (기존 ImageViewerOptions를 확장)
interface ZipImageViewerOptions extends ImageViewerOptions {
  sortImagesBy: 'name' | 'date' | 'size';
  autoPlayEnabled: boolean;
  autoPlayInterval: number;
  loopEnabled: boolean;
}

// 컨텍스트 타입 정의
interface ViewerSettingsContextType {
  textViewerOptions: TextViewerOptions;
  pdfViewerOptions: PDFViewerOptions;
  imageViewerOptions: ImageViewerOptions;
  epubViewerOptions: EPUBViewerOptions;
  zipViewerOptions: ZipImageViewerOptions;
  updateTextViewerOptions: (options: Partial<TextViewerOptions>) => void;
  updatePDFViewerOptions: (options: Partial<PDFViewerOptions>) => void;
  updateImageViewerOptions: (options: Partial<ImageViewerOptions>) => void;
  updateEPUBViewerOptions: (options: Partial<EPUBViewerOptions>) => void;
  updateZipViewerOptions: (options: Partial<ZipImageViewerOptions>) => void;
}

// 기본값
const defaultTextViewerOptions: TextViewerOptions = {
  fontSize: 16,
  lineHeight: 1.5,
  fontFamily: 'System',
  theme: 'light',
  textColor: '#333',
  backgroundColor: '#fff',
  marginHorizontal: 16,
  marginVertical: 16,
};

const defaultPDFViewerOptions: PDFViewerOptions = {
  viewMode: 'page',
  enableRTL: false,
  enableCache: true,
  enableDoubleTapZoom: true,
  theme: 'light',
  lastPage: 1,
};

const defaultImageViewerOptions: ImageViewerOptions = {
  enableDoubleTapZoom: true,
  enablePreload: true,
  enableCache: true,
  contentFit: 'contain',
  backgroundColor: '#000',
  theme: 'light',
  showPageIndicator: true,
};

const defaultEPUBViewerOptions: EPUBViewerOptions = {
  viewMode: 'page',
  enableRTL: false,
  fontSize: 16,
  lineHeight: 1.5,
  fontFamily: 'System',
  theme: 'light',
  textColor: '#333',
  backgroundColor: '#fff',
  linkColor: '#0066cc',
  marginHorizontal: 16,
  marginVertical: 16,
  enableTOC: true,
  enableAnnotation: false,
  enableBookmark: true,
  enableSearch: true,
  enableTextSelection: true,
};

const defaultZipViewerOptions: ZipImageViewerOptions = {
  enableDoubleTapZoom: true,
  enablePreload: true,
  enableCache: true,
  contentFit: 'contain',
  backgroundColor: '#000',
  sortImagesBy: 'name',
  autoPlayEnabled: false,
  autoPlayInterval: 3,
  loopEnabled: true,
  theme: 'light',
  showPageIndicator: true,
};

// 컨텍스트 생성
export const ViewerSettingsContext = createContext<ViewerSettingsContextType>({
  textViewerOptions: defaultTextViewerOptions,
  pdfViewerOptions: defaultPDFViewerOptions,
  imageViewerOptions: defaultImageViewerOptions,
  epubViewerOptions: defaultEPUBViewerOptions,
  zipViewerOptions: defaultZipViewerOptions,
  updateTextViewerOptions: () => {},
  updatePDFViewerOptions: () => {},
  updateImageViewerOptions: () => {},
  updateEPUBViewerOptions: () => {},
  updateZipViewerOptions: () => {},
});

interface ViewerSettingsProviderProps {
  children: React.ReactNode;
}

export const ViewerSettingsProvider: React.FC<ViewerSettingsProviderProps> = ({ children }) => {
  // 각 뷰어 설정 상태
  const [textViewerOptions, setTextViewerOptions] =
    useState<TextViewerOptions>(defaultTextViewerOptions);
  const [pdfViewerOptions, setPDFViewerOptions] =
    useState<PDFViewerOptions>(defaultPDFViewerOptions);
  const [imageViewerOptions, setImageViewerOptions] =
    useState<ImageViewerOptions>(defaultImageViewerOptions);
  const [epubViewerOptions, setEPUBViewerOptions] =
    useState<EPUBViewerOptions>(defaultEPUBViewerOptions);
  const [zipViewerOptions, setZipViewerOptions] =
    useState<ZipImageViewerOptions>(defaultZipViewerOptions);

  // 초기 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 텍스트 뷰어 설정
        const textSettings = await AsyncStorage.getItem(TEXT_VIEWER_KEY);
        if (textSettings) {
          setTextViewerOptions((prev) => ({ ...prev, ...JSON.parse(textSettings) }));
        }

        // PDF 뷰어 설정
        const pdfSettings = await AsyncStorage.getItem(PDF_VIEWER_KEY);
        if (pdfSettings) {
          setPDFViewerOptions((prev) => {
            const loaded = JSON.parse(pdfSettings);
            const { showPageNumbers, ...rest } = loaded;
            return { ...prev, ...rest, lastPage: rest.lastPage ?? 1 };
          });
        }

        // 이미지 뷰어 설정
        const imageSettings = await AsyncStorage.getItem(IMAGE_VIEWER_KEY);
        if (imageSettings) {
          setImageViewerOptions((prev) => ({ ...prev, ...JSON.parse(imageSettings) }));
        }

        // EPUB 뷰어 설정
        const epubSettings = await AsyncStorage.getItem(EPUB_VIEWER_KEY);
        if (epubSettings) {
          setEPUBViewerOptions((prev) => ({ ...prev, ...JSON.parse(epubSettings) }));
        }

        // ZIP 이미지 뷰어 설정
        const zipSettings = await AsyncStorage.getItem(ZIP_VIEWER_KEY);
        if (zipSettings) {
          setZipViewerOptions((prev) => ({ ...prev, ...JSON.parse(zipSettings) }));
        }
      } catch (error) {
        console.error('뷰어 설정을 불러오는 중 오류 발생:', error);
      }
    };

    loadSettings();
  }, []);

  // 텍스트 뷰어 설정 업데이트
  const updateTextViewerOptions = useCallback(async (options: Partial<TextViewerOptions>) => {
    setTextViewerOptions((prev) => {
      const newOptions = { ...prev, ...options };

      // AsyncStorage에 저장
      AsyncStorage.setItem(TEXT_VIEWER_KEY, JSON.stringify(newOptions)).catch((err) =>
        console.error('텍스트 뷰어 설정 저장 오류:', err),
      );

      return newOptions;
    });
  }, []);

  // PDF 뷰어 설정 업데이트
  const updatePDFViewerOptions = useCallback(async (options: Partial<PDFViewerOptions>) => {
    setPDFViewerOptions((prev) => {
      const newOptions = { ...prev, ...options };

      // AsyncStorage에 저장
      AsyncStorage.setItem(PDF_VIEWER_KEY, JSON.stringify(newOptions)).catch((err) =>
        console.error('PDF 뷰어 설정 저장 오류:', err),
      );

      return newOptions;
    });
  }, []);

  // 이미지 뷰어 설정 업데이트
  const updateImageViewerOptions = useCallback(async (options: Partial<ImageViewerOptions>) => {
    setImageViewerOptions((prev) => {
      const newOptions = { ...prev, ...options };

      // AsyncStorage에 저장
      AsyncStorage.setItem(IMAGE_VIEWER_KEY, JSON.stringify(newOptions)).catch((err) =>
        console.error('이미지 뷰어 설정 저장 오류:', err),
      );

      return newOptions;
    });
  }, []);

  // EPUB 뷰어 설정 업데이트
  const updateEPUBViewerOptions = useCallback(async (options: Partial<EPUBViewerOptions>) => {
    setEPUBViewerOptions((prev) => {
      const newOptions = { ...prev, ...options };

      // AsyncStorage에 저장
      AsyncStorage.setItem(EPUB_VIEWER_KEY, JSON.stringify(newOptions)).catch((err) =>
        console.error('EPUB 뷰어 설정 저장 오류:', err),
      );

      return newOptions;
    });
  }, []);

  // ZIP 이미지 뷰어 설정 업데이트
  const updateZipViewerOptions = useCallback(async (options: Partial<ZipImageViewerOptions>) => {
    setZipViewerOptions((prev) => {
      const newOptions = { ...prev, ...options };

      // AsyncStorage에 저장
      AsyncStorage.setItem(ZIP_VIEWER_KEY, JSON.stringify(newOptions)).catch((err) =>
        console.error('ZIP 뷰어 설정 저장 오류:', err),
      );

      return newOptions;
    });
  }, []);

  // 컨텍스트 값
  const contextValue: ViewerSettingsContextType = {
    textViewerOptions,
    pdfViewerOptions,
    imageViewerOptions,
    epubViewerOptions,
    zipViewerOptions,
    updateTextViewerOptions,
    updatePDFViewerOptions,
    updateImageViewerOptions,
    updateEPUBViewerOptions,
    updateZipViewerOptions,
  };

  return (
    <ViewerSettingsContext.Provider value={contextValue}>{children}</ViewerSettingsContext.Provider>
  );
};
