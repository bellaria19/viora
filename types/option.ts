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
  showPageIndicator?: boolean; // 페이지 인디케이터 표시 여부(기본값 true)

  // 색상 설정
  backgroundColor: string;
}

// PDF 뷰어 옵션
export interface PDFViewerOptions extends BaseViewerOptions {
  /**
   * 뷰어 모드 (페이지별 보기/스크롤 보기)
   * 'page': 한 페이지씩 넘김, 'scroll': 전체 스크롤
   */
  viewMode: 'scroll' | 'page';

  /**
   * RTL(오른쪽→왼쪽) 읽기 지원
   */
  enableRTL: boolean;

  /**
   * PDF 캐시 사용 여부
   */
  enableCache: boolean;

  /**
   * 더블탭 확대/축소 기능 사용 여부
   */
  enableDoubleTapZoom: boolean;

  /**
   * 최근 본 페이지 (자동 저장/복원용, UI 노출 X)
   */
  lastPage?: number;

  // 색상 설정
  backgroundColor: string;
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

  /**
   * 최근 본 페이지 (자동 저장/복원용, UI 노출 X)
   */
  lastPage?: number;
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
