// 뷰어 모드 옵션
export const VIEW_MODE_OPTIONS = [
  { value: 'page', label: '페이지', icon: 'file' },
  { value: 'scroll', label: '스크롤', icon: 'scroll' },
];

// 이미지 표시 방식 옵션
export const CONTENT_FIT_OPTIONS = [
  { value: 'contain', label: 'Contain' },
  { value: 'cover', label: 'Cover' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
];

// 글꼴 옵션
export const FONTS = [
  { value: 'System', label: '시스템' },
  { value: 'NotoSansKR', label: 'Noto Sans KR' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Pretendard', label: 'Pretendard' },
];

// 테마 옵션
export const THEMES = [
  { value: 'light', label: '라이트', bgColor: '#ffffff', textColor: '#333333' },
  { value: 'dark', label: '다크', bgColor: '#1a1a1a', textColor: '#eeeeee' },
  { value: 'sepia', label: '세피아', bgColor: '#f8f1e3', textColor: '#5b4636' },
];

// 색상 옵션
export const TEXT_COLOR_OPTIONS = ['#000000', '#ffffff', '#eeeeee', '#5b4636'];
export const BACKGROUND_COLOR_OPTIONS = ['#000000', '#ffffff', '#1a1a1a', '#f8f1e3'];
