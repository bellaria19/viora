// 파일 관련 타입 정의
export type FileType = 'text' | 'image' | 'pdf' | 'epub' | 'zip';

export interface FileInfo {
  id: string;
  name: string;
  uri: string;
  type: FileType;
  size: number;
  modifiedTime: number;
  lastViewedTime?: number;
}

export interface DuplicateFile {
  sourceUri: string;
  fileName: string;
  handled?: boolean;
  overwrite?: boolean;
}
