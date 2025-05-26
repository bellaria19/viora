import { Overlay, SettingsBottomSheet } from '@/components/common';
import { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { BACKGROUND_COLOR_OPTIONS, CONTENT_FIT_OPTIONS } from '@/constants/option';

import { useViewerSettings } from '@/hooks/useViewerSettings';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);
  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

  // 애니메이션 상태 값 (이미지 확대/축소 및 이동용)
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const panX = useSharedValue(0);
  const savedPanX = useSharedValue(0);
  const panY = useSharedValue(0);
  const savedPanY = useSharedValue(0);
  const swipeTranslateX = useSharedValue(0);
  // pager 스크롤 가능 여부 (확대 시 스크롤 비활성화용)
  const [isPagerScrollEnabled, setPagerScrollEnabled] = useState(true);

  // 페이지 변경 이벤트
  const handlePageChange = useCallback(
    (e: any) => {
      const newIndex = e.nativeEvent.position;
      setIndex(newIndex);
    },
    [setIndex],
  );

  // 특정 페이지로 이동
  const goToPage = useCallback(
    (pageIndex: number) => {
      if (pagerRef.current && pageIndex >= 0 && pageIndex < images.length) {
        pagerRef.current.setPage(pageIndex);
        setIndex(pageIndex);
      }
    },
    [images.length, pagerRef, setIndex],
  );

  // 슬라이더로 페이지 변경 시 처리
  const handleSliderPageChange = useCallback(
    (page: number) => {
      goToPage(page - 1);
    },
    [goToPage],
  );

  // 초기 페이지 설정
  useEffect(() => {
    if (pagerRef.current && index >= 0 && index < images.length) {
      pagerRef.current.setPageWithoutAnimation(index);
    }
  }, [pagerRef, images.length]);

  // 제스처 설정
  // 핀치 제스처
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
      // 확대 상태에 따라 PagerView 스크롤 가능 여부 설정
      if (scale.value > 1.05 && isPagerScrollEnabled) {
        runOnJS(setPagerScrollEnabled)(false);
      } else if (scale.value <= 1.05 && !isPagerScrollEnabled) {
        runOnJS(setPagerScrollEnabled)(true);
      }
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // 축소 시 중앙으로 복원
      if (scale.value <= 1) {
        scale.value = 1;
        savedScale.value = 1;
        panX.value = 0;
        panY.value = 0;
        savedPanX.value = 0;
        savedPanY.value = 0;
        runOnJS(setPagerScrollEnabled)(true);
      }
    });

  // 팬 제스처 (확대 후 이미지 이동)
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

  // 더블 탭 제스처 (확대/축소)
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((e) => {
      if (!imageViewerOptions.enableDoubleTapZoom) return;

      if (scale.value > 1) {
        // 축소
        scale.value = 1;
        panX.value = 0;
        panY.value = 0;
        savedScale.value = 1;
        savedPanX.value = 0;
        savedPanY.value = 0;
        runOnJS(setPagerScrollEnabled)(true);
      } else {
        // 확대 (탭 위치 중심으로)
        scale.value = 2;
        savedScale.value = 2;
        runOnJS(setPagerScrollEnabled)(false);
      }
    });

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

  // 이미지 스타일 (확대/축소 및 이동)
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: panX.value }, { translateY: panY.value }, { scale: scale.value }],
    };
  });

  // 설정 섹션 메모이제이션
  const sections = useMemo<SettingsSection[]>(
    () => [
      {
        title: '표시 설정',
        data: [
          {
            key: 'contentFit',
            type: 'button-group',
            value: imageViewerOptions.contentFit,
            label: '이미지 표시 방식',
            options: CONTENT_FIT_OPTIONS,
          },
          {
            key: 'backgroundColor',
            type: 'color-group',
            value: imageViewerOptions.backgroundColor,
            label: '배경 색상',
            colorOptions: BACKGROUND_COLOR_OPTIONS,
          },
        ],
      },
      {
        title: '기능 설정',
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
    ],
    [imageViewerOptions],
  );

  const [errorStates, setErrorStates] = useState<boolean[]>([]);

  useEffect(() => {
    setErrorStates(Array(images.length).fill(false));
  }, [images.length]);

  const handleError = (pageIndex: number) => {
    setErrorStates((prev) => {
      const next = [...prev];
      next[pageIndex] = true;
      return next;
    });
  };

  const handleLoadStart = (pageIndex: number) => {
    setErrorStates((prev) => {
      const next = [...prev];
      next[pageIndex] = false;
      return next;
    });
  };

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

  // 단일 이미지 페이지 렌더링
  const renderImagePage = useCallback(
    (imageUri: string, pageIndex: number) => {
      return (
        <View style={styles.imagePageContainer} key={`page-${pageIndex}`}>
          <Animated.View style={imageAnimatedStyle}>
            {!errorStates[pageIndex] && (
              <ExpoImage
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit={imageViewerOptions.contentFit}
                onLoadStart={() => {
                  setIsLoading(true);
                  handleLoadStart(pageIndex);
                  // setHasError(false);
                }}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => handleError(pageIndex)}
                cachePolicy={imageViewerOptions.enableCache ? 'memory-disk' : 'none'}
                priority={imageViewerOptions.enablePreload ? 'high' : 'normal'}
              />
            )}
            {errorStates[pageIndex] && renderFallback()}
          </Animated.View>
        </View>
      );
    },
    [composed, imageAnimatedStyle, imageViewerOptions, renderFallback],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={{ flex: 1, backgroundColor: imageViewerOptions.backgroundColor }}>
          <GestureDetector gesture={composed}>
            <PagerView
              ref={pagerRef}
              style={{ flex: 1 }}
              initialPage={index}
              onPageSelected={handlePageChange}
              orientation="horizontal"
              scrollEnabled={isPagerScrollEnabled}
            >
              {images.map((img, idx) => renderImagePage(img, idx))}
            </PagerView>
          </GestureDetector>

          <Overlay
            visible={overlayVisible}
            onBack={() => navigation.goBack()}
            onSettings={() => setSettingsVisible(true)}
            showSlider={images.length > 1}
            currentPage={index + 1}
            totalPages={images.length}
            onPageChange={handleSliderPageChange}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imagePageContainer: {
    flex: 1,
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
    backgroundColor: 'black',
  },
  fallbackTextWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
