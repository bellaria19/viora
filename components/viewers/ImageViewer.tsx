import { Overlay, SettingsBottomSheet } from '@/components/common';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { getImageSections } from '@/utils/sections/imageSections';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  uri: string | string[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export default function ImageViewer({ uri, currentIndex, onIndexChange }: ImageViewerProps) {
  const images = Array.isArray(uri) ? uri : [uri];
  const [internalIndex, setInternalIndex] = useState(0);
  const index = currentIndex !== undefined ? currentIndex : internalIndex;
  const setIndex = onIndexChange || setInternalIndex;

  const [isLoading, setIsLoading] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);
  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

  // 애니메이션 상태 값
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const panX = useSharedValue(0);
  const savedPanX = useSharedValue(0);
  const panY = useSharedValue(0);
  const savedPanY = useSharedValue(0);

  const [isPagerScrollEnabled, setPagerScrollEnabled] = useState(true);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const insets = useSafeAreaInsets();

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
  }, [pagerRef, images.length, index]);

  // 제스처 설정 (기존 코드와 동일)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
      if (scale.value > 1.05 && isPagerScrollEnabled) {
        runOnJS(setPagerScrollEnabled)(false);
      } else if (scale.value <= 1.05 && !isPagerScrollEnabled) {
        runOnJS(setPagerScrollEnabled)(true);
      }
    })
    .onEnd(() => {
      savedScale.value = scale.value;
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
        runOnJS(setPagerScrollEnabled)(true);
      } else {
        scale.value = 2;
        savedScale.value = 2;
        runOnJS(setPagerScrollEnabled)(false);
      }
    });

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value <= 1) {
        // 스와이프 로직 (기존과 동일)
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1) {
        if (e.translationX < -80 && index < images.length - 1) {
          runOnJS(goToPage)(index + 1);
        } else if (e.translationX > 80 && index > 0) {
          runOnJS(goToPage)(index - 1);
        }
      }
    });

  const composed = Gesture.Simultaneous(
    Gesture.Simultaneous(pinchGesture, doubleTapGesture),
    Gesture.Simultaneous(panGesture, swipeGesture),
  );

  // 이미지 스타일 (확대/축소, 이동, 회전 포함)
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: panX.value }, { translateY: panY.value }, { scale: scale.value }],
    };
  });

  const sections = useMemo(() => getImageSections(imageViewerOptions), [imageViewerOptions]);

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
                style={{ width: windowWidth, height: windowHeight }}
                contentFit={imageViewerOptions.contentFit}
                onLoadStart={() => {
                  setIsLoading(true);
                  handleLoadStart(pageIndex);
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
    [
      imageAnimatedStyle,
      windowWidth,
      windowHeight,
      imageViewerOptions,
      renderFallback,
      errorStates,
    ],
  );

  // 화면 회전 제어: 뷰어 진입 시 가로/세로 허용, 벗어날 때 세로 고정
  useEffect(() => {
    // 진입 시: 모든 방향 허용
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    return () => {
      // 뷰어를 벗어날 때: 세로 고정
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.bottom }}>
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
  fallbackContainer: {
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
