import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import * as ZipArchive from 'react-native-zip-archive';

import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import Overlay from '../common/Overlay';
import ImageViewer from './ImageViewer';

interface ZipImageViewerProps {
  uri: string;
}

export default function ZipImageViewer({ uri }: ZipImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const navigation = useNavigation();
  const extractionCancelled = useRef(false);

  // ZIP 이미지 뷰어 설정
  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

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

  const extractAndLoadImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      extractionCancelled.current = false;

      // 이전 임시 디렉토리 정리
      await cleanupTempDirectory();

      // 파일 존재 여부 확인
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        setError('ZIP 파일을 찾을 수 없습니다.');
        return;
      }

      // 임시 디렉토리 생성
      await FileSystem.makeDirectoryAsync(tempDirectory, {
        intermediates: true,
      });

      // ZIP 파일 압축 해제
      await ZipArchive.unzip(uri, tempDirectory);

      // 압축 해제가 취소된 경우
      if (extractionCancelled.current) {
        await cleanupTempDirectory();
        return;
      }

      // 이미지 파일 찾기
      const files = await FileSystem.readDirectoryAsync(tempDirectory);
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

      if (imageFiles.length === 0) {
        setError('ZIP 파일에 이미지가 없습니다.');
        await cleanupTempDirectory();
        return;
      }

      // 이미지 정렬
      const sortedImages = sortImages(imageFiles);

      // 이미지 경로 검증
      const validImages = await Promise.all(
        sortedImages.map(async (file) => {
          const imagePath = `${tempDirectory}${file}`;
          try {
            const imageInfo = await FileSystem.getInfoAsync(imagePath);
            return imageInfo.exists ? imagePath : null;
          } catch {
            return null;
          }
        }),
      );

      // 유효한 이미지 경로만 필터링
      const filteredImages = validImages.filter((path): path is string => path !== null);

      setImages(filteredImages);
      setCurrentIndex(0); // 첫 번째 이미지로 초기화
    } catch (err) {
      console.error('Error extracting ZIP:', err);
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
  }, [tempDirectory, uri, sortImages, cleanupTempDirectory]);

  useEffect(() => {
    extractAndLoadImages();
    return () => {
      // 컴포넌트 언마운트 시 정리
      extractionCancelled.current = true;
      cleanupTempDirectory();
    };
  }, [extractAndLoadImages, cleanupTempDirectory]);

  // 페이지 변경 핸들러
  const handleIndexChange = useCallback((index: number) => {
    console.log(`ZipImageViewer: handleIndexChange called with index ${index}`);
    setCurrentIndex(index);
  }, []);

  // 설정 섹션
  const sections: SettingsSection[] = useMemo(
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

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updateImageViewerOptions({ [key]: value });
    },
    [updateImageViewerOptions],
  );

  if (isLoading) {
    return (
      <View style={[styles.container]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={[styles.loadingText]}>ZIP 파일 처리 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container]}>
        <Text style={[styles.errorText]}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={styles.container}>
          {images.length > 0 && (
            <ImageViewer
              uri={images}
              currentIndex={currentIndex}
              onIndexChange={handleIndexChange}
            />
          )}
          <Overlay
            visible={overlayVisible}
            onBack={() => {
              cleanupTempDirectory();
              navigation.goBack();
            }}
            onSettings={() => setSettingsVisible(true)}
            showSlider={images.length > 1}
            currentPage={currentIndex + 1}
            totalPages={images.length}
            onPageChange={handleIndexChange}
          />
        </View>
      </TouchableWithoutFeedback>
      <SettingsBottomSheet
        title="이미지 설정"
        isVisible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        sections={sections}
        onOptionChange={handleOptionChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});
