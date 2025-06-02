import {
  BACKGROUND_COLOR_OPTIONS,
  FONTS,
  TEXT_COLOR_OPTIONS,
  VIEW_MODE_OPTIONS,
} from '@/constants/option';
import { SettingSectionData } from '@/types/settings';

export function getEpubSections(options: any): SettingSectionData[] {
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
      title: '글꼴 설정',
      data: [
        {
          key: 'fontFamily',
          type: 'button-group',
          value: options.fontFamily,
          label: '글꼴',
          options: FONTS.map((f) => ({ value: f.value, label: f.label })),
        },
        {
          key: 'fontSize',
          type: 'stepper',
          value: options.fontSize,
          label: '글자 크기',
          min: 16,
          max: 34,
          step: 2,
          unit: 'px',
        },
        {
          key: 'fontWeight',
          type: 'stepper',
          value: parseInt(options.fontWeight || '400', 10),
          label: '글자 두께',
          min: 100,
          max: 900,
          step: 100,
          formatValue: (value: number) => (value / 100).toString(),
        },
        {
          key: 'lineHeight',
          type: 'stepper',
          value: options.lineHeight,
          label: '줄 간격',
          min: 1.0,
          max: 2.5,
          step: 0.1,
          formatValue: (value: number) => value.toFixed(1),
        },
      ],
    },
    {
      title: '표시 설정',
      data: [
        {
          key: 'textColor',
          type: 'color-group',
          value: options.textColor,
          label: '글자 색상',
          options: TEXT_COLOR_OPTIONS,
        },
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
      title: '여백 설정',
      data: [
        {
          key: 'marginHorizontal',
          type: 'stepper',
          value: options.marginHorizontal,
          label: '가로 여백',
          min: 0,
          max: 40,
          step: 2,
          unit: 'px',
        },
        {
          key: 'marginVertical',
          type: 'stepper',
          value: options.marginVertical,
          label: '세로 여백',
          min: 0,
          max: 40,
          step: 2,
          unit: 'px',
        },
      ],
    },
  ];
}
