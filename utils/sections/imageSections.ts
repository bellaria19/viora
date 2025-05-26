import {
  BACKGROUND_COLOR_OPTIONS,
  CONTENT_FIT_OPTIONS,
  ROTATION_OPTIONS,
} from '@/constants/option';
import { SettingSectionData } from '@/types/settings';

export function getImageSections(options: any): SettingSectionData[] {
  return [
    {
      title: '표시 설정',
      data: [
        {
          key: 'contentFit',
          type: 'button-group',
          value: options.contentFit,
          label: '이미지 표시 방식',
          options: CONTENT_FIT_OPTIONS,
        },
        {
          key: 'backgroundColor',
          type: 'color-group',
          value: options.backgroundColor,
          label: '배경 색상',
          options: BACKGROUND_COLOR_OPTIONS,
        },
        {
          key: 'rotation',
          type: 'button-group',
          value: options.rotation ?? 0,
          label: '회전 각도',
          options: ROTATION_OPTIONS,
        },
      ],
    },
    {
      title: '기능 설정',
      data: [
        {
          key: 'enableDoubleTapZoom',
          type: 'switch',
          value: options.enableDoubleTapZoom,
          label: '더블 탭 확대/축소',
          description: '두 번 탭하여 확대 또는 축소',
        },
      ],
    },
    {
      title: '성능 설정',
      data: [
        {
          key: 'enablePreload',
          type: 'switch',
          value: options.enablePreload,
          label: '이미지 미리 로드',
          description: '다음 이미지를 미리 로드합니다',
        },
        {
          key: 'enableCache',
          type: 'switch',
          value: options.enableCache,
          label: '이미지 캐싱',
          description: '메모리 사용량이 증가하지만 성능이 향상됩니다',
        },
      ],
    },
  ];
}
