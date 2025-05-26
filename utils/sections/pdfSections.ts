import { BACKGROUND_COLOR_OPTIONS, VIEW_MODE_OPTIONS } from '@/constants/option';
import { SettingSectionData } from '@/types/settings';

export function getPdfSections(options: any): SettingSectionData[] {
  return [
    {
      title: '뷰어 설정',
      data: [
        {
          key: 'viewMode',
          type: 'button-group',
          value: options.viewMode,
          label: '뷰어 모드',
          options: VIEW_MODE_OPTIONS,
        },
        {
          key: 'enableRTL',
          type: 'switch',
          value: options.enableRTL,
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
          value: options.backgroundColor,
          label: '배경 색상',
          options: BACKGROUND_COLOR_OPTIONS,
        },
      ],
    },
    {
      title: '성능 설정',
      data: [
        {
          key: 'enableDoubleTapZoom',
          type: 'switch',
          value: options.enableDoubleTapZoom,
          label: '더블 탭 확대/축소',
          description: '두 번 탭하여 확대 또는 축소',
        },
        {
          key: 'enableCache',
          type: 'switch',
          value: options.enableCache,
          label: '캐시 사용',
          description: '메모리 사용량이 증가하지만 성능이 향상됩니다',
        },
      ],
    },
  ];
}
