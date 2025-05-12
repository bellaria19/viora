import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Overlay from '../common/Overlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

interface ImageViewerProps {
  uri: string;
}

export default function ImageViewer({ uri }: ImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const navigation = useNavigation();

  // 이미지 뷰어 설정
  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

  // 제스처 상태값
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

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
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      // 이미지가 화면 밖으로 너무 많이 벗어나지 않도록 조정
      const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
      const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

      if (Math.abs(translateX.value) > maxTranslateX) {
        translateX.value = withSpring(Math.sign(translateX.value) * maxTranslateX, SPRING_CONFIG);
        savedTranslateX.value = translateX.value;
      }

      if (Math.abs(translateY.value) > maxTranslateY) {
        translateY.value = withSpring(Math.sign(translateY.value) * maxTranslateY, SPRING_CONFIG);
        savedTranslateY.value = translateY.value;
      }
    });

  // 더블 탭 제스처
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (!imageViewerOptions.enableDoubleTapZoom) return;

      if (scale.value > 1) {
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2, SPRING_CONFIG);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(Gesture.Race(pinchGesture, doubleTapGesture), panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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
        <View style={styles.container}>
          <GestureDetector gesture={composed}>
            <Animated.View
              style={[animatedStyle, { backgroundColor: imageViewerOptions.backgroundColor }]}
            >
              {!hasError ? (
                <ExpoImage
                  source={{ uri }}
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
              ) : (
                fallbackView()
              )}
              {isLoading && <ActivityIndicator size="large" style={[styles.loading]} />}
            </Animated.View>
          </GestureDetector>
          <Overlay
            visible={overlayVisible}
            onBack={() => navigation.goBack()}
            onSettings={() => setSettingsVisible(true)}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* 설정 바텀 시트 */}
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
