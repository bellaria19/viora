// 뷰어 옵션 타입 정의

// 뷰어 공통 옵션 (베이스 타입)
export interface BaseViewerOptions {}

// 이미지 뷰어 옵션
export interface ImageViewerOptions extends BaseViewerOptions {
  /**
   * 더블탭 확대/축소 기능 사용 여부
   */
  enableDoubleTapZoom: boolean;

  /**
   * 이미지 미리 불러오기(Preload) 사용 여부
   */
  enablePreload: boolean;
  /**
   * 이미지 캐시 사용 여부
   */
  enableCache: boolean;

  /**
   * 이미지 표시 방식
   * 'contain': 비율 유지 전체 표시, 'cover': 비율 유지 채우기, 'fill': 비율 무시 채우기, 'none': 원본 크기
   */
  contentFit: 'contain' | 'cover' | 'fill' | 'none';
  /**
   * 페이지 인디케이터 표시 여부(기본값 true)
   */
  showPageIndicator?: boolean;

  /**
   * 배경 색상
   */
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

  /**
   * 배경 색상
   */
  backgroundColor: string;
}

// 텍스트 뷰어 옵션
export interface TextViewerOptions extends BaseViewerOptions {
  /**
   * 폰트 크기(px)
   */
  fontSize: number;
  /**
   * 줄 간격(배수)
   */
  lineHeight: number;
  /**
   * 폰트 패밀리
   */
  fontFamily: string;

  /**
   * 텍스트 색상
   */
  textColor: string;
  /**
   * 배경 색상
   */
  backgroundColor: string;

  /**
   * 가로 여백(px)
   */
  marginHorizontal: number;
  /**
   * 세로 여백(px)
   */
  marginVertical: number;

  /**
   * 최근 본 페이지 (자동 저장/복원용, UI 노출 X)
   */
  lastPage?: number;
}

// EPUB 뷰어 옵션
export interface EPUBViewerOptions extends BaseViewerOptions {
  /**
   * 뷰어 모드 설정
   * 'page': 한 페이지씩 넘김, 'scroll': 전체 스크롤
   */
  viewMode: 'scroll' | 'page';
  /**
   * 테마 설정
   * 'light': 라이트, 'dark': 다크, 'sepia': 세피아
   */
  theme: 'light' | 'dark' | 'sepia';
  /**
   * 폰트 크기(px)
   */
  fontSize: number;
  /**
   * 폰트 패밀리
   */
  fontFamily: string;
  /**
   * RTL(오른쪽→왼쪽) 읽기 지원
   */
  enableRTL: boolean;

  /**
   * 줄 간격(배수)
   */
  lineHeight: number;

  /**
   * 텍스트 색상
   */
  textColor: string;
  /**
   * 배경 색상
   */
  backgroundColor: string;
  /**
   * 링크 색상
   */
  linkColor: string;

  /**
   * 가로 여백(px)
   */
  marginHorizontal: number;
  /**
   * 세로 여백(px)
   */
  marginVertical: number;
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
