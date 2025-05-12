import { DuplicateFile, FileInfo } from '@/types/files';
import * as DocumentPicker from 'expo-document-picker';
import { addRecentFile, copyFile } from './fileManager';

interface FilePickerResult {
  selectedFiles: DocumentPicker.DocumentPickerAsset[];
  duplicateFiles: DuplicateFile[];
}

export const pickFiles = async (): Promise<FilePickerResult | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf', 'application/epub+zip', 'text/*', 'application/zip'],
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (!result.assets || result.assets.length === 0) {
      return null;
    }

    return {
      selectedFiles: result.assets,
      duplicateFiles: [],
    };
  } catch (error) {
    console.error('Error picking files:', error);
    return null;
  }
};

export const checkDuplicates = (
  selectedFiles: DocumentPicker.DocumentPickerAsset[],
  existingFiles: FileInfo[],
): DuplicateFile[] => {
  const duplicates: DuplicateFile[] = [];

  for (const file of selectedFiles) {
    const existingFile = existingFiles.find((f) => f.name === file.name);
    if (existingFile) {
      duplicates.push({
        sourceUri: file.uri,
        fileName: file.name,
        handled: false,
      });
    }
  }

  return duplicates;
};

export const processFiles = async (
  selectedFiles: DocumentPicker.DocumentPickerAsset[],
  duplicateFiles: DuplicateFile[],
): Promise<FileInfo[]> => {
  const newFiles: FileInfo[] = [];

  for (const file of selectedFiles) {
    const duplicate = duplicateFiles.find((d) => d.fileName === file.name);

    // 중복 파일이 아니거나, 중복 파일이지만 덮어쓰기로 선택된 경우
    if (!duplicate || (duplicate.handled && duplicate.overwrite)) {
      const fileInfo = await copyFile(file.uri, file.name);
      if (fileInfo) {
        newFiles.push(fileInfo);
        await addRecentFile(fileInfo);
      }
    }
  }

  return newFiles;
};
