// 뷰어 옵션 타입 정의

// 뷰어 공통 옵션 (베이스 타입)
export interface BaseViewerOptions {
  theme: 'light' | 'dark' | 'sepia';
}

// 이미지 뷰어 옵션
export interface ImageViewerOptions extends BaseViewerOptions {
  enableDoubleTapZoom: boolean;

  // 성능 설정
  enablePreload: boolean;
  enableCache: boolean;

  // 표시 설정
  contentFit: 'contain' | 'cover' | 'fill' | 'none';

  // 색상 설정
  backgroundColor: string;
}

// ZIP 이미지 뷰어 옵션
export interface ZipImageViewerOptions extends ImageViewerOptions {
  sortImagesBy: 'name' | 'date' | 'size';
  autoPlayEnabled: boolean;
  autoPlayInterval: number; // 초 단위
  loopEnabled: boolean;
}

// PDF 뷰어 옵션
export interface PDFViewerOptions extends BaseViewerOptions {
  // 뷰어 모드 설정
  viewMode: 'scroll' | 'page';
  enableRTL: boolean;

  // 페이지 표시 설정
  pageSpacing: number;
  showPageNumbers: boolean;

  // 성능 설정
  enableCache: boolean;

  // 확대/축소 설정
  enableDoubleTapZoom: boolean;

  // 화면 표시 설정
  showLoadingIndicator: boolean;
  showThumbnails: boolean;
}

// 텍스트 뷰어 옵션
export interface TextViewerOptions extends BaseViewerOptions {
  // 텍스트 표시 설정
  fontSize: number;
  lineHeight: number;
  fontFamily: string;

  // 색상 설정
  textColor: string;
  backgroundColor: string;

  // 여백 설정
  marginHorizontal: number;
  marginVertical: number;
}

// EPUB 뷰어 옵션
export interface EPUBViewerOptions extends BaseViewerOptions {
  // 뷰어 모드 설정
  viewMode: 'scroll' | 'page';
  enableRTL: boolean;

  // 텍스트 설정
  fontSize: number;
  lineHeight: number;
  fontFamily: string;

  // 색상 설정
  textColor: string;
  backgroundColor: string;
  linkColor: string;

  // 여백 설정
  marginHorizontal: number;
  marginVertical: number;

  // 기타 설정
  enableTOC: boolean; // 목차 표시 여부
  enableAnnotation: boolean; // 주석 기능 활성화
  enableBookmark: boolean; // 북마크 기능 활성화
  enableSearch: boolean; // 검색 기능 활성화
  enableTextSelection: boolean; // 텍스트 선택 기능 활성화
}

// 설정 컴포넌트 props 인터페이스
export interface ViewerSettingsProps<T> {
  options: T;
  onOptionsChange: (newOptions: Partial<T>) => void;
  onClose?: () => void;
  visible?: boolean;
}

export type TextViewerSettingsProps = ViewerSettingsProps<TextViewerOptions>;
export type PDFViewerSettingsProps = ViewerSettingsProps<PDFViewerOptions>;
export type EPUBViewerSettingsProps = ViewerSettingsProps<EPUBViewerOptions>;
export type ImageViewerSettingsProps = ViewerSettingsProps<ImageViewerOptions>;
export type ZipImageViewerSettingsProps = ViewerSettingsProps<ZipImageViewerOptions>;
