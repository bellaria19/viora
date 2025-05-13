import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Overlay from '../common/Overlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

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
  const [hasError, setHasError] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const navigation = useNavigation();

  // 이미지 뷰어 설정
  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

  // 애니메이션 상태
  const offset = useSharedValue(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const prevIndex = useRef(index);

  useEffect(() => {
    if (prevIndex.current !== index) {
      // 방향 결정
      const direction = index > prevIndex.current ? 'left' : 'right';
      setSlideDirection(direction);
      // offset을 즉시 이동
      offset.value = direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH;
      setTimeout(() => {
        offset.value = 0;
        prevIndex.current = index;
        setSlideDirection(null);
      }, 0);
    }
  }, [index]);

  // 제스처 상태값
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const panX = useSharedValue(0);
  const savedPanX = useSharedValue(0);
  const panY = useSharedValue(0);
  const savedPanY = useSharedValue(0);
  const swipeTranslateX = useSharedValue(0); // 스와이프 시 임시 이동 상태

  // 이미지 애니메이션 스타일들
  // 각 스타일마다 useAnimatedStyle을 미리 선언해서 React Hooks 규칙 위반 방지
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

  // 핀치 제스처
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // 이미지 내에서 움직이는 팬 제스처
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // 확대 상태에서만 이미지 내부 이동 허용
      if (scale.value > 1) {
        panX.value = savedPanX.value + e.translationX;
        panY.value = savedPanY.value + e.translationY;
      }
    })
    .onEnd(() => {
      // 현재 상태 저장
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

  // 페이지 전환 함수
  const goToPage = (index: number) => {
    setIndex(index);
  };

  // 좌우 스와이프 제스처
  const swipeGesture = Gesture.Pan()
    .onBegin(() => {
      // 확대 상태가 아닐 때만 스와이프 동작 허용
      if (scale.value <= 1) {
        swipeTranslateX.value = 0; // 초기화
      }
    })
    .onUpdate((e) => {
      // 확대 상태가 아닐 때만 스와이프 업데이트
      if (scale.value <= 1) {
        // 첫 페이지에서 오른쪽, 마지막 페이지에서 왼쪽 스와이프 시 저항감 부여
        if (
          (index === 0 && e.translationX > 0) ||
          (index === images.length - 1 && e.translationX < 0)
        ) {
          swipeTranslateX.value = e.translationX * 0.3; // 저항감 (30%만 움직임)
        } else {
          swipeTranslateX.value = e.translationX;
        }
      }
    })
    .onEnd((e) => {
      // 확대 상태가 아닐 때만 페이지 전환
      if (scale.value <= 1) {
        if (e.translationX < -80 && index < images.length - 1) {
          runOnJS(goToPage)(index + 1);
        } else if (e.translationX > 80 && index > 0) {
          runOnJS(goToPage)(index - 1);
        }
        // 페이지 전환 여부와 상관없이 스와이프 상태 초기화
        swipeTranslateX.value = 0;
      }
    });

  // 제스처 조합 - 확대 상태에 따라 다른 제스처 활성화
  const composed = Gesture.Simultaneous(
    // 핀치와 더블탭은 항상 사용 가능
    Gesture.Simultaneous(pinchGesture, doubleTapGesture),
    // 확대 상태에 따라 적절히 처리되는 팬/스와이프 제스처들
    Gesture.Simultaneous(panGesture, swipeGesture),
  );

  // SectionList 데이터 구조 정의
  const colorOptions = ['#ffffff', '#000000', '#222222', '#444444', '#666666', '#888888'];
  const contentFitOptions = [
    { value: 'contain', label: 'Contain' },
    { value: 'cover', label: 'Cover' },
    { value: 'fill', label: 'Fill' },
    { value: 'none', label: 'None' },
  ];
  const sections: SettingsSection[] = [
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
          options: contentFitOptions,
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
          colorOptions,
        },
      ],
    },
  ];

  const handleOptionChange = (key: string, value: any) => {
    updateImageViewerOptions({ [key]: value });
  };

  const fallbackView = () => {
    return (
      <View style={styles.fallbackContainer}>
        <FontAwesome6 name="image" size={64} color="#ccc" />
        <View style={{ height: 12 }} />
        <View style={styles.fallbackTextWrapper}>
          <Text style={styles.fallbackText}>이미지를 불러올 수 없습니다</Text>
        </View>
      </View>
    );
  };

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
                    source={{ uri: images[prevIndex.current] }}
                    style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
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
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
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
                {hasError && fallbackView()}
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
            onPageChange={(page) => goToPage(page - 1)}
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
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
