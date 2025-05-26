// 옵션 타입 정의
export type SettingOptionType =
  | {
      type: 'button-group';
      key: string;
      label: string;
      value: any;
      options: { value: any; label: string; icon?: string }[];
    }
  | { type: 'switch'; key: string; label: string; value: boolean; description?: string }
  | {
      type: 'color-group';
      key: string;
      label: string;
      value: string;
      options: string[];
    }
  | {
      type: 'stepper';
      key: string;
      label: string;
      value: number;
      min: number;
      max: number;
      step: number;
      unit?: string;
      formatValue?: (value: number) => string;
    };

export type SettingSectionData = {
  title: string;
  data: SettingOptionType[];
};
