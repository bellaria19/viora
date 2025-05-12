import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export const APP_DIRECTORY = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}viora/` : null;
const RECENT_FILES_KEY = 'recent_files';



// 앱 디렉토리 초기화
export const initializeFileSystem = async () => {
  if (!APP_DIRECTORY) {
    throw new Error('Document directory is not available');
  }

  try {
    const dirInfo = await FileSystem.getInfoAsync(APP_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(APP_DIRECTORY, {
        intermediates: true,
      });
    }
  } catch (error) {
    console.error('Error initializing file system:', error);
    throw error;
  }
};

// 파일 정보 가져오기
export const getFileInfo = async (uri: string): Promise<FileInfo | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
    if (!fileInfo.exists) return null;

    const name = uri.split('/').pop() || '';
    const type = getFileType(name);

    // modificationTime이 없는 경우 파일의 생성 시간을 가져오기 위해 stat 사용
    const modTime = fileInfo.modificationTime || Date.now();
    return {
      id: uri,
      name,
      uri,
      type,
      size: fileInfo.size || 0,
      modifiedTime: modTime * 1000, // 밀리초 단위로 변환
      lastViewedTime: Date.now(),
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

// 파일 복사
export const copyFile = async (sourceUri: string, fileName: string): Promise<FileInfo | null> => {
  if (!APP_DIRECTORY) {
    throw new Error('Document directory is not available');
  }

  try {
    const destination = `${APP_DIRECTORY}${fileName}`;
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destination,
    });

    return await getFileInfo(destination);
  } catch (error) {
    console.error('Error copying file:', error);
    return null;
  }
};

// 파일 타입 확인
export const getFileType = (fileName: string): FileInfo['type'] => {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'epub':
      return 'epub';
    case 'zip':
      return 'zip';
    default:
      return 'text';
  }
};

// 최근 파일 목록 관리
export const getRecentFiles = async (): Promise<FileInfo[]> => {
  try {
    const recentFiles = await AsyncStorage.getItem(RECENT_FILES_KEY);
    if (!recentFiles) return [];

    const files = JSON.parse(recentFiles);
    // 파일이 실제로 존재하는지 확인
    const existingFiles = await Promise.all(
      files.map(async (file: FileInfo) => {
        const exists = await FileSystem.getInfoAsync(file.uri);
        return exists.exists ? file : null;
      }),
    );

    const validFiles = existingFiles.filter((file): file is FileInfo => file !== null);
    // 존재하지 않는 파일들이 있었다면 목록 업데이트
    if (validFiles.length !== files.length) {
      await AsyncStorage.setItem(RECENT_FILES_KEY, JSON.stringify(validFiles));
    }

    return validFiles;
  } catch (error) {
    console.error('Error getting recent files:', error);
    return [];
  }
};

export const addRecentFile = async (file: FileInfo) => {
  try {
    const recentFiles = await getRecentFiles();
    const existingFile = recentFiles.find((f) => f.id === file.id);

    const updatedFile = {
      ...file,
      lastViewedTime: Date.now(),
    };

    let updatedFiles;
    if (existingFile) {
      // 기존 파일이 있으면 lastViewedTime만 업데이트
      updatedFiles = recentFiles.map((f) => (f.id === file.id ? updatedFile : f));
    } else {
      // 새로운 파일이면 목록 앞에 추가
      updatedFiles = [updatedFile, ...recentFiles].slice(0, 10);
    }

    await AsyncStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updatedFiles));
    return updatedFile;
  } catch (error) {
    console.error('Error adding recent file:', error);
    return file;
  }
};

// 디렉토리 내 파일 목록 가져오기
export const getDirectoryContents = async (directory: string = APP_DIRECTORY || ''): Promise<FileInfo[]> => {
  try {
    const files = await FileSystem.readDirectoryAsync(directory);
    const fileInfos = await Promise.all(
      files.map(async (fileName) => {
        const uri = `${directory}${fileName}`;
        const info = await getFileInfo(uri);
        return info;
      }),
    );
    return fileInfos.filter((info): info is FileInfo => info !== null);
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
};

// 모든 파일 초기화
export const resetAllFiles = async (): Promise<void> => {
  try {
    if (!APP_DIRECTORY) {
      throw new Error('Document directory is not available');
    }

    // 디렉토리 내 모든 파일 삭제
    const files = await FileSystem.readDirectoryAsync(APP_DIRECTORY);
    await Promise.all(
      files.map((fileName) =>
        FileSystem.deleteAsync(`${APP_DIRECTORY}${fileName}`, {
          idempotent: true,
        }),
      ),
    );

    // 최근 파일 목록 초기화
    await AsyncStorage.removeItem(RECENT_FILES_KEY);

    // 디렉토리 재생성
    await initializeFileSystem();
  } catch (error) {
    console.error('Error resetting files:', error);
    throw error;
  }
};
