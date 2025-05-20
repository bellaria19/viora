import { DuplicateFile } from './files';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface FileOptionsModalProps extends BaseModalProps {
  fileName?: string;
  onRename: () => void;
  onDelete: () => void;
}

export interface DeleteFileModalProps extends BaseModalProps {
  fileName?: string;
  onConfirm: () => void;
}

export interface RenameFileModalProps extends BaseModalProps {
  value: string;
  onChange: (text: string) => void;
  onConfirm: () => void;
}

export interface DuplicateFileModalProps extends BaseModalProps {
  currentFile: DuplicateFile | null;
  currentIndex: number;
  totalCount: number;
  onSkip: () => void;
  onOverwrite: () => void;
}
