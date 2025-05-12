// 정렬 관련 타입 정의
export type SortOptionId =
  | 'name_asc'
  | 'name_desc'
  | 'size_asc'
  | 'size_desc'
  | 'date_asc'
  | 'date_desc';

export interface SortMenuItem {
  id: SortOptionId;
  label: string;
  icon: string;
}

export enum SortOption {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  SIZE_ASC = 'size_asc',
  SIZE_DESC = 'size_desc',
  DATE_ASC = 'date_asc',
  DATE_DESC = 'date_desc',
}

export const sortOptions: SortMenuItem[] = [
  { id: 'name_asc', label: '이름 (오름차순)', icon: 'arrow-down-a-z' },
  { id: 'name_desc', label: '이름 (내림차순)', icon: 'arrow-down-z-a' },
  { id: 'size_desc', label: '크기 (큰순)', icon: 'arrow-down-wide-short' },
  { id: 'size_asc', label: '크기 (작은순)', icon: 'arrow-down-short-wide' },
  { id: 'date_asc', label: '날짜 (오래된순)', icon: 'arrow-down-1-9' },
  { id: 'date_desc', label: '날짜 (최신순)', icon: 'arrow-down-9-1' },
];
