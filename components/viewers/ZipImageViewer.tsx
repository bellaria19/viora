import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as ZipArchive from 'react-native-zip-archive';
import ImageViewer from './ImageViewer';
import ViewerError from './ViewerError';
import ViewerLoading from './ViewerLoading';

interface ZipImageViewerProps {
  uri: string;
}

export default function ZipImageViewer({ uri }: ZipImageViewerProps) {
  // 기본 상태 설정
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [password, setPassword] = useState('');
  const [waitingPassword, setWaitingPassword] = useState(false);

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

  const showPasswordAlert = (incorrectPassword: boolean = false) => {
    Alert.prompt(
      '비밀번호 입력',
      incorrectPassword
        ? '비밀번호가 올바르지 않습니다. 다시 입력해주세요.'
        : 'ZIP 파일이 비밀번호로 보호되어 있습니다. 비밀번호를 입력해주세요.',
      [
        {
          text: '취소',
          onPress: () => {
            setError('압축 해제가 취소되었습니다.');
            setWaitingPassword(false);
            setIsLoading(false);
          },
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: (password: string = '') => {
            if (password.trim() === '') {
              // 비밀번호가 비어있으면 다시 프롬프트 표시
              showPasswordAlert(false);
              return;
            }
            setPassword(password);
            console.log('password', password);
            setWaitingPassword(false);
            setIsLoading(true);
            // 입력받은 비밀번호로 다시 추출 시도
            extractAndLoadImages(password);
          },
        },
      ],
      'secure-text',
      '',
      'default',
    );
  };

  const extractAndLoadImages = useCallback(
    async (password?: string) => {
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
          setIsLoading(false);
          return;
        }

        // 임시 디렉토리 생성
        await FileSystem.makeDirectoryAsync(tempDirectory, { intermediates: true });

        // 암호 보호 여부 확인
        const isPasswordProtected = await ZipArchive.isPasswordProtected(uri);

        if (isPasswordProtected && !password) {
          if (!waitingPassword) {
            // 이미 대기 중이면 또 띄우지 않음
            setWaitingPassword(true);
            // setIsLoading(false);
            showPasswordAlert(false);
          }
          return;
        }

        // ZIP 파일 압축 해제
        try {
          if (isPasswordProtected) {
            const processedPassword = password ? password.trim() : '';
            await ZipArchive.unzipWithPassword(uri, tempDirectory, processedPassword);
          } else {
            await ZipArchive.unzip(uri, tempDirectory);
          }
        } catch (e) {
          console.error('[ZIP] 압축 해제 실패:', e);
          if (isPasswordProtected) {
            setError('비밀번호가 올바르지 않거나 압축 해제에 실패했습니다.');
            // setWaitingPassword(true);
            setIsLoading(false);
            await cleanupTempDirectory();
            return;
          }
          throw e;
        }

        // 압축 해제가 취소된 경우
        if (extractionCancelled.current) {
          await cleanupTempDirectory();
          return;
        }

        // 이미지 파일 찾기
        let files = await FileSystem.readDirectoryAsync(tempDirectory);
        let imageFiles = files.filter((file) => {
          const lower = file.toLowerCase();
          return (
            lower.endsWith('.jpg') ||
            lower.endsWith('.jpeg') ||
            lower.endsWith('.png') ||
            lower.endsWith('.gif') ||
            lower.endsWith('.webp')
          );
        });

        // 폴더가 1개만 있고 이미지가 없을 때, 그 폴더 내부를 탐색
        if (imageFiles.length === 0) {
          console.log('[ZIP] 루트에 이미지 없음, 폴더 탐색 시도');
          const folderCandidates: string[] = [];
          for (const name of files) {
            if (name === '__MACOSX') continue;
            const info = await FileSystem.getInfoAsync(tempDirectory + name);
            if (info.isDirectory) {
              folderCandidates.push(name);
            }
          }
          if (folderCandidates.length === 1) {
            const subDir = tempDirectory + folderCandidates[0] + '/';
            const subFiles = await FileSystem.readDirectoryAsync(subDir);
            imageFiles = subFiles
              .filter((file) => {
                const lower = file.toLowerCase();
                return (
                  lower.endsWith('.jpg') ||
                  lower.endsWith('.jpeg') ||
                  lower.endsWith('.png') ||
                  lower.endsWith('.gif') ||
                  lower.endsWith('.webp')
                );
              })
              .map((file) => folderCandidates[0] + '/' + file); // 상대 경로 유지
            files = subFiles.map((file) => folderCandidates[0] + '/' + file);
          } else if (folderCandidates.length > 1) {
            setError('ZIP 파일 내에 여러 폴더가 있고 이미지가 없습니다. 파일 구조를 확인해주세요.');
            setIsLoading(false);
            setWaitingPassword(false); // 비밀번호 입력 대기 해제
            await cleanupTempDirectory();
            console.error('[ZIP] 압축 해제 실패: 여러 폴더가 있고 이미지가 없음');
            return;
          }
        }

        if (imageFiles.length === 0) {
          setError('ZIP 파일에 이미지가 없습니다.');
          setIsLoading(false);
          await cleanupTempDirectory();
          console.error('[ZIP] 압축 해제 실패: 이미지 없음');
          return;
        }

        const sortedImages = sortImages(imageFiles);

        const validImages = await Promise.all(
          sortedImages.map(async (file) => {
            const imagePath = `${tempDirectory}${file}`;
            try {
              const imageInfo = await FileSystem.getInfoAsync(imagePath);
              return imageInfo.exists ? imagePath : null;
            } catch (e) {
              return null;
            }
          }),
        );

        const filteredImages = validImages.filter((path): path is string => path !== null);

        if (filteredImages.length === 0) {
          setError('ZIP 파일에 유효한 이미지가 없습니다.');
          setIsLoading(false);
          await cleanupTempDirectory();
          console.error('[ZIP] 압축 해제 실패: 유효한 이미지 없음');
          return;
        }

        setImages(filteredImages);
        setCurrentIndex(0);
        setIsLoading(false);
      } catch (err) {
        console.error('[ZIP] 압축 해제 실패:', err);
        if (err instanceof Error) {
          setError(`ZIP 파일을 처리하는 중 오류가 발생했습니다: ${err.message}`);
        } else {
          setError('ZIP 파일을 처리하는 중 오류가 발생했습니다.');
        }
        setIsLoading(false);
        await cleanupTempDirectory();
      }
    },
    [tempDirectory, uri, sortImages, cleanupTempDirectory],
  );

  useEffect(() => {
    if (!waitingPassword && !error && images.length === 0) {
      extractAndLoadImages(password);
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

  // 오류 발생 시 렌더링
  if (error) {
    return <ViewerError message={error} />;
  }

  // 로딩 중 렌더링
  if (isLoading || waitingPassword) {
    return (
      <ViewerLoading
        message={
          isLoading
            ? 'ZIP 파일 처리 중...'
            : 'ZIP 파일이 비밀번호로 보호되어 있습니다.\n 비밀번호를 입력해주세요.'
        }
      />
    );
  }

  // ZIP 파일에서 추출한 이미지가 없는 경우
  if (images.length === 0) {
    return <ViewerError message="표시할 이미지가 없습니다." />;
  }

  return <ImageViewer uri={images} currentIndex={currentIndex} onIndexChange={handleIndexChange} />;
}
