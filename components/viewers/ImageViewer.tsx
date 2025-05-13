import Overlay from '@/components/common/Overlay';
import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  uri: string | string[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export default function ImageViewer({ uri, currentIndex, onIndexChange }: ImageViewerProps) {
  // 기본 상태 설정
  const images = Array.isArray(uri) ? uri : [uri];
  const [internalIndex, setInternalIndex] = useState(0);
  const index = currentIndex !== undefined ? currentIndex : internalIndex;
  const setIndex = onIndexChange || setInternalIndex;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const navigation = useNavigation();
  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

  // 애니메이션 상태 값
  const offset = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const panX = useSharedValue(0);
  const savedPanX = useSharedValue(0);
  const panY = useSharedValue(0);
  const savedPanY = useSharedValue(0);
  const swipeTranslateX = useSharedValue(0);

  // 애니메이션 스타일
  const currentImageStyle = useAnimatedStyle(() => {
    let baseX = 0;
    if (slideDirection) {
      baseX = slideDirection === 'left' ? offset.value - SCREEN_WIDTH : offset.value + SCREEN_WIDTH;
    }
    return {
      position: 'absolute',
      left: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      transform: [
        { translateX: baseX + panX.value + swipeTranslateX.value },
        { translateY: panY.value },
        { scale: scale.value },
      ],
    };
  });

  const prevImageStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      transform: [{ translateX: offset.value }, { translateY: 0 }, { scale: 1 }],
    };
  });

  // 페이지 전환 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      setIndex(page - 1);
    },
    [setIndex],
  );

  // 특정 페이지로 이동
  const goToPage = useCallback(
    (index: number) => {
      setIndex(index);

      // 슬라이드 방향 결정 및 애니메이션 처리는 useEffect로 이동
      const direction = index > internalIndex ? 'left' : 'right';
      setSlideDirection(direction);

      // offset을 즉시 이동
      offset.value = direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH;
      setTimeout(() => {
        offset.value = 0;
        setSlideDirection(null);
      }, 0);
    },
    [internalIndex, offset, setIndex],
  );

  // 제스처 설정
  // 핀치 제스처
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // 팬 제스처
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        panX.value = savedPanX.value + e.translationX;
        panY.value = savedPanY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedPanX.value = panX.value;
      savedPanY.value = panY.value;
    });

  // 더블 탭 제스처
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (!imageViewerOptions.enableDoubleTapZoom) return;
      if (scale.value > 1) {
        scale.value = 1;
        panX.value = 0;
        panY.value = 0;
        savedScale.value = 1;
        savedPanX.value = 0;
        savedPanY.value = 0;
      } else {
        scale.value = 2;
        savedScale.value = 2;
      }
    });

  // 좌우 스와이프 제스처
  const swipeGesture = Gesture.Pan()
    .onBegin(() => {
      if (scale.value <= 1) {
        swipeTranslateX.value = 0;
      }
    })
    .onUpdate((e) => {
      if (scale.value <= 1) {
        if (
          (index === 0 && e.translationX > 0) ||
          (index === images.length - 1 && e.translationX < 0)
        ) {
          swipeTranslateX.value = e.translationX * 0.3;
        } else {
          swipeTranslateX.value = e.translationX;
        }
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1) {
        if (e.translationX < -80 && index < images.length - 1) {
          runOnJS(goToPage)(index + 1);
        } else if (e.translationX > 80 && index > 0) {
          runOnJS(goToPage)(index - 1);
        }
        swipeTranslateX.value = 0;
      }
    });

  // 제스처 조합
  const composed = Gesture.Simultaneous(
    Gesture.Simultaneous(pinchGesture, doubleTapGesture),
    Gesture.Simultaneous(panGesture, swipeGesture),
  );

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

  // 옵션 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updateImageViewerOptions({ [key]: value });
    },
    [updateImageViewerOptions],
  );

  // 이미지 로드 실패 시 대체 컴포넌트
  const renderFallback = useCallback(
    () => (
      <View style={styles.fallbackContainer}>
        <FontAwesome6 name="image" size={64} color="#ccc" />
        <View style={{ height: 12 }} />
        <View style={styles.fallbackTextWrapper}>
          <Text style={styles.fallbackText}>이미지를 불러올 수 없습니다</Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={[styles.container, { backgroundColor: imageViewerOptions.backgroundColor }]}>
          <GestureDetector gesture={composed}>
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
              {/* 이전 이미지 */}
              {slideDirection && (
                <Animated.View style={prevImageStyle}>
                  <ExpoImage
                    source={{ uri: images[index - (slideDirection === 'left' ? 1 : -1)] }}
                    style={styles.image}
                    contentFit={imageViewerOptions.contentFit}
                    cachePolicy={imageViewerOptions.enableCache ? 'memory-disk' : 'none'}
                    priority={imageViewerOptions.enablePreload ? 'high' : 'normal'}
                  />
                </Animated.View>
              )}

              {/* 현재 이미지 */}
              <Animated.View style={currentImageStyle}>
                <ExpoImage
                  source={{ uri: images[index] }}
                  style={styles.image}
                  contentFit={imageViewerOptions.contentFit}
                  onLoadStart={() => {
                    setIsLoading(true);
                    setHasError(false);
                  }}
                  onLoadEnd={() => setIsLoading(false)}
                  onError={() => setHasError(true)}
                  cachePolicy={imageViewerOptions.enableCache ? 'memory-disk' : 'none'}
                  priority={imageViewerOptions.enablePreload ? 'high' : 'normal'}
                />
                {hasError && renderFallback()}
              </Animated.View>
            </View>
          </GestureDetector>

          <Overlay
            visible={overlayVisible}
            onBack={() => navigation.goBack()}
            onSettings={() => setSettingsVisible(true)}
            showSlider={images.length > 1}
            currentPage={index + 1}
            totalPages={images.length}
            onPageChange={handlePageChange}
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fallbackContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  fallbackTextWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
