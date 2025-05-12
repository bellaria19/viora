import { DuplicateFile, FileInfo } from '@/types/files';
import { checkDuplicates, pickFiles, processFiles } from '@/utils/filePickerManager';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';

interface UseFilePickerProps {
  existingFiles: FileInfo[];
  onFilesProcessed: (newFiles: FileInfo[]) => void;
}

export function useFilePicker({ existingFiles, onFilesProcessed }: UseFilePickerProps) {
  const [duplicateFiles, setDuplicateFiles] = useState<DuplicateFile[]>([]);
  const [currentDuplicateIndex, setCurrentDuplicateIndex] = useState<number>(-1);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);

  const handleFilePick = async () => {
    try {
      const result = await pickFiles();

      if (result) {
        setSelectedFiles(result.selectedFiles);
        const duplicates = checkDuplicates(result.selectedFiles, existingFiles);

        if (duplicates.length > 0) {
          setDuplicateFiles(duplicates);
          setCurrentDuplicateIndex(0);
          setShowDuplicateModal(true);
        } else {
          const newFiles = await processFiles(result.selectedFiles, []);
          if (newFiles.length > 0) {
            onFilesProcessed(newFiles);
          }
        }
      }
    } catch (error) {
      console.error('Error picking files:', error);
    }
  };

  const handleDuplicateSkip = () => {
    if (currentDuplicateIndex >= 0) {
      setDuplicateFiles((prev) => {
        const updated = [...prev];
        updated[currentDuplicateIndex] = {
          ...updated[currentDuplicateIndex],
          handled: true,
          overwrite: false,
        };
        return updated;
      });
      moveToNextDuplicate();
    }
  };

  const handleDuplicateOverwrite = () => {
    if (currentDuplicateIndex >= 0) {
      setDuplicateFiles((prev) => {
        const updated = [...prev];
        updated[currentDuplicateIndex] = {
          ...updated[currentDuplicateIndex],
          handled: true,
          overwrite: true,
        };
        return updated;
      });
      moveToNextDuplicate();
    }
  };

  const moveToNextDuplicate = () => {
    if (currentDuplicateIndex < duplicateFiles.length - 1) {
      setCurrentDuplicateIndex((prev) => prev + 1);
    } else {
      setShowDuplicateModal(false);
      setCurrentDuplicateIndex(-1);
      processFiles(selectedFiles, duplicateFiles).then((newFiles) => {
        if (newFiles.length > 0) {
          onFilesProcessed(newFiles);
        }
      });
    }
  };

  const currentDuplicateFile =
    currentDuplicateIndex >= 0 ? duplicateFiles[currentDuplicateIndex] : null;

  return {
    showDuplicateModal,
    currentDuplicateFile,
    currentDuplicateIndex,
    duplicateFiles,
    handleFilePick,
    handleDuplicateSkip,
    handleDuplicateOverwrite,
  };
}
