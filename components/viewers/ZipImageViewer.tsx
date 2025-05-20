import { SettingsSection } from '@/components/common/SettingsBottomSheet';
import PasswordModal from '@/components/files/PasswordModal';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as ZipArchive from 'react-native-zip-archive';
import ImageViewer from './ImageViewer';

interface ZipImageViewerProps {
  uri: string;
}

export default function ZipImageViewer({ uri }: ZipImageViewerProps) {
  // 기본 상태 설정
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [waitingPassword, setWaitingPassword] = useState(false);

  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();
  const extractionCancelled = useRef(false);

  // 이미지를 추출할 임시 디렉토리 생성
  const tempDirectory = useMemo(() => `${FileSystem.cacheDirectory}zip-viewer-${Date.now()}/`, []);

  // 이미지 정렬 함수
  const sortImages = useCallback((imageFiles: string[]) => {
    return [...imageFiles].sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, []);

  // 임시 디렉토리 정리 함수
  const cleanupTempDirectory = useCallback(async () => {
    try {
      if (tempDirectory) {
        await FileSystem.deleteAsync(tempDirectory, { idempotent: true });
      }
    } catch (err) {
      console.error('Error cleaning up temp directory:', err);
    }
  }, [tempDirectory]);

  // ZIP 파일 추출 및 이미지 로드
  const extractAndLoadImages = useCallback(
    async (password?: string) => {
      try {
        console.log('[ZIP] 압축 해제 시작');
        setIsLoading(true);
        setError(null);
        extractionCancelled.current = false;
        setPasswordError(undefined);

        // 이전 임시 디렉토리 정리
        console.log('[ZIP] 임시 디렉토리 정리 시작');
        await cleanupTempDirectory();
        console.log('[ZIP] 임시 디렉토리 정리 완료');

        // 파일 존재 여부 확인
        console.log('[ZIP] 파일 존재 확인:', uri);
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          setError('ZIP 파일을 찾을 수 없습니다.');
          return;
        }

        // 임시 디렉토리 생성
        console.log('[ZIP] 임시 디렉토리 생성:', tempDirectory);
        await FileSystem.makeDirectoryAsync(tempDirectory, { intermediates: true });
        console.log('[ZIP] 임시 디렉토리 생성 완료');

        // 암호 보호 여부 확인
        const isPasswordProtected = await ZipArchive.isPasswordProtected(uri);
        console.log('[ZIP] 암호 보호 여부:', isPasswordProtected);

        if (isPasswordProtected && !password) {
          setPasswordModalVisible(true);
          setWaitingPassword(true);
          setIsLoading(false);
          return;
        } else {
          setWaitingPassword(false);
        }

        // ZIP 파일 압축 해제
        console.log('[ZIP] 압축 해제 실행:', uri, tempDirectory, password);
        try {
          if (isPasswordProtected) {
            await ZipArchive.unzip(uri, tempDirectory, password);
          } else {
            await ZipArchive.unzip(uri, tempDirectory);
          }
        } catch (e) {
          if (isPasswordProtected) {
            setPasswordError('비밀번호가 올바르지 않습니다.');
            setPasswordModalVisible(true);
            setIsLoading(false);
            return;
          }
          throw e;
        }
        console.log('[ZIP] 압축 해제 완료');

        // 압축 해제가 취소된 경우
        if (extractionCancelled.current) {
          console.log('[ZIP] 압축 해제 취소됨');
          await cleanupTempDirectory();
          return;
        }

        // 이미지 파일 찾기
        console.log('[ZIP] 압축 해제 후 파일 목록:', uri);
        const files = await FileSystem.readDirectoryAsync(tempDirectory);
        console.log('[ZIP] 압축 해제 후 파일 목록:', files);
        const imageFiles = files.filter((file) => {
          const lower = file.toLowerCase();
          return (
            lower.endsWith('.jpg') ||
            lower.endsWith('.jpeg') ||
            lower.endsWith('.png') ||
            lower.endsWith('.gif') ||
            lower.endsWith('.webp')
          );
        });
        console.log('[ZIP] 이미지 파일 목록:', imageFiles);

        if (imageFiles.length === 0) {
          setError('ZIP 파일에 이미지가 없습니다.');
          await cleanupTempDirectory();
          return;
        }

        const sortedImages = sortImages(imageFiles);
        console.log('[ZIP] 정렬된 이미지 파일:', sortedImages);

        const validImages = await Promise.all(
          sortedImages.map(async (file) => {
            const imagePath = `${tempDirectory}${file}`;
            try {
              const imageInfo = await FileSystem.getInfoAsync(imagePath);
              console.log('[ZIP] 이미지 경로 확인:', imagePath, imageInfo.exists);
              return imageInfo.exists ? imagePath : null;
            } catch (e) {
              console.log('[ZIP] 이미지 경로 확인 중 오류:', imagePath, e);
              return null;
            }
          }),
        );
        console.log('[ZIP] 이미지 경로 검증 완료');

        const filteredImages = validImages.filter((path): path is string => path !== null);
        console.log('[ZIP] 유효한 이미지 경로:', filteredImages);

        setImages(filteredImages);
        setCurrentIndex(0);
      } catch (err) {
        console.error('[ZIP] Error extracting ZIP:', err);
        if (err instanceof Error) {
          setError(`ZIP 파일을 처리하는 중 오류가 발생했습니다: ${err.message}`);
        } else {
          setError('ZIP 파일을 처리하는 중 오류가 발생했습니다.');
        }
        await cleanupTempDirectory();
      } finally {
        if (!extractionCancelled.current) {
          setIsLoading(false);
        }
      }
    },
    [tempDirectory, uri, sortImages, cleanupTempDirectory],
  );

  useEffect(() => {
    if (!waitingPassword) {
      extractAndLoadImages();
    }
    return () => {
      extractionCancelled.current = true;
      cleanupTempDirectory();
    };
  }, [extractAndLoadImages, cleanupTempDirectory, waitingPassword]);

  // 인덱스 변경 핸들러
  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // 설정 섹션 메모이제이션
  const sections = useMemo<SettingsSection[]>(
    () => [
      {
        title: '제스처 설정',
        data: [
          {
            key: 'enableDoubleTapZoom',
            type: 'switch',
            value: imageViewerOptions.enableDoubleTapZoom,
            label: '더블 탭 확대/축소',
          },
        ],
      },
      {
        title: '성능 설정',
        data: [
          {
            key: 'enablePreload',
            type: 'switch',
            value: imageViewerOptions.enablePreload,
            label: '이미지 미리 로드',
          },
          {
            key: 'enableCache',
            type: 'switch',
            value: imageViewerOptions.enableCache,
            label: '이미지 캐싱',
          },
        ],
      },
      {
        title: '표시 설정',
        data: [
          {
            key: 'contentFit',
            type: 'button-group',
            value: imageViewerOptions.contentFit,
            label: '이미지 표시 방식',
            options: [
              { value: 'contain', label: 'Contain' },
              { value: 'cover', label: 'Cover' },
              { value: 'fill', label: 'Fill' },
              { value: 'none', label: 'None' },
            ],
          },
        ],
      },
      {
        title: '색상 설정',
        data: [
          {
            key: 'backgroundColor',
            type: 'color-group',
            value: imageViewerOptions.backgroundColor,
            label: '배경 색상',
            colorOptions: ['#ffffff', '#000000', '#222222', '#444444', '#666666', '#888888'],
          },
        ],
      },
    ],
    [imageViewerOptions],
  );

  // 비밀번호 모달 확인 핸들러
  const handlePasswordConfirm = useCallback(() => {
    setPasswordModalVisible(false);
    setIsLoading(true);
    setWaitingPassword(false);
    extractAndLoadImages(passwordInput);
  }, [passwordInput, extractAndLoadImages]);

  // 비밀번호 모달 취소 핸들러
  const handlePasswordCancel = useCallback(() => {
    setPasswordModalVisible(false);
    setPasswordInput('');
    setPasswordError(undefined);
    setError('압축 해제가 취소되었습니다.');
  }, []);

  // 로딩 중 렌더링
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>ZIP 파일 처리 중...</Text>
      </View>
    );
  }

  // 오류 발생 시 렌더링
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // ZIP 파일에서 추출한 이미지가 없는 경우
  if (images.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>표시할 이미지가 없습니다.</Text>
      </View>
    );
  }

  return (
    <>
      <ImageViewer uri={images} currentIndex={currentIndex} onIndexChange={handleIndexChange} />
      <PasswordModal
        visible={passwordModalVisible}
        value={passwordInput}
        onChange={setPasswordInput}
        onCancel={handlePasswordCancel}
        onConfirm={handlePasswordConfirm}
        error={passwordError}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    color: '#ff3b30',
  },
});
