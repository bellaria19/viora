import Overlay from '@/components/common/Overlay';
import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { FONTS, THEMES } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TextViewerProps {
  uri: string;
}

interface Page {
  index: number;
  text: string;
}

export default function TextViewer({ uri }: TextViewerProps) {
  const [content, setContent] = useState('');
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const { textViewerOptions, updateTextViewerOptions } = useViewerSettings();

  // 스와이프 애니메이션 변수
  const swipeTranslateX = useSharedValue(0);
  const isSwipeInProgress = useSharedValue(false);

  // 텍스트 파일 불러오기
  // UTF-8만 지원
  const loadTextContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo || !fileInfo.exists) {
        throw new Error('파일이 존재하지 않습니다.');
      }
      const text = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setContent(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [uri]);

  // 페이지로 분할하기
  const splitIntoPages = useCallback(() => {
    if (!content) {
      setPages([{ index: 0, text: content }]);
      setTotalPages(1);
      return;
    }

    // 페이지당 글자 수 계산 (폰트 크기와 화면 크기에 따라 조정)
    const fontSize = textViewerOptions.fontSize;
    const lineHeight = textViewerOptions.lineHeight;
    const marginHorizontal = textViewerOptions.marginHorizontal;
    const marginVertical = textViewerOptions.marginVertical;

    // 화면에 표시할 수 있는 텍스트의 근사치 계산
    const charPerLine = Math.floor((SCREEN_WIDTH - marginHorizontal * 2) / (fontSize * 0.6));
    const linesPerPage = Math.floor((SCREEN_HEIGHT - marginVertical * 2) / (fontSize * lineHeight));
    const charsPerPage = charPerLine * linesPerPage * 0.85; // 85%만 사용하여 여유 공간 확보

    // 텍스트 분할
    const pageTexts: Page[] = [];
    let remainingText = content;
    let pageIndex = 0;

    while (remainingText.length > 0) {
      let pageEnd = Math.min(remainingText.length, charsPerPage);

      // 페이지 끝에서 단어 중간에 자르지 않도록 조정
      if (pageEnd < remainingText.length) {
        // 가장 가까운 공백이나 줄바꿈 찾기
        const lastSpace = remainingText.lastIndexOf(' ', pageEnd);
        const lastNewline = remainingText.lastIndexOf('\n', pageEnd);
        const cutPoint = Math.max(lastSpace, lastNewline);

        if (cutPoint > 0) {
          pageEnd = cutPoint + 1; // 공백 또는 줄바꿈 이후
        }
      }

      pageTexts.push({
        index: pageIndex++,
        text: remainingText.substring(0, pageEnd),
      });

      remainingText = remainingText.substring(pageEnd);
    }

    setPages(pageTexts);
    setTotalPages(pageTexts.length);

    // 저장된 마지막 페이지 확인
    if (
      textViewerOptions.lastPage &&
      textViewerOptions.lastPage > 0 &&
      textViewerOptions.lastPage <= pageTexts.length
    ) {
      setCurrentPage(textViewerOptions.lastPage);
      // FlatList가 렌더링된 후 해당 페이지로 스크롤
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: textViewerOptions.lastPage ? textViewerOptions.lastPage - 1 : 0,
            animated: false,
          });
        }
      }, 100);
    } else {
      setCurrentPage(1);
    }
  }, [
    content,
    textViewerOptions.fontSize,
    textViewerOptions.lineHeight,
    textViewerOptions.marginHorizontal,
    textViewerOptions.marginVertical,
    textViewerOptions.lastPage,
  ]);

  useEffect(() => {
    loadTextContent();
  }, [loadTextContent]);

  useEffect(() => {
    splitIntoPages();
  }, [
    splitIntoPages,
    content,
    textViewerOptions.fontSize,
    textViewerOptions.lineHeight,
    textViewerOptions.marginHorizontal,
    textViewerOptions.marginVertical,
  ]);

  // 페이지 변경 처리
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) {
        return;
      }

      setCurrentPage(page);

      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: page - 1,
          animated: false,
        });
      }

      // 마지막 페이지 저장
      updateTextViewerOptions({ lastPage: page });
    },
    [totalPages, updateTextViewerOptions],
  );

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.floor(offsetX / SCREEN_WIDTH) + 1;

      if (page !== currentPage) {
        setCurrentPage(page);
        updateTextViewerOptions({ lastPage: page });
      }
    },
    [currentPage, updateTextViewerOptions],
  );

  // 스와이프 제스처
  const swipeGesture = Gesture.Pan()
    .onBegin(() => {
      isSwipeInProgress.value = true;
      swipeTranslateX.value = 0;
    })
    .onUpdate((e) => {
      if (isSwipeInProgress.value) {
        // 첫 페이지에서 오른쪽으로 스와이프하거나 마지막 페이지에서 왼쪽으로 스와이프할 때 저항 추가
        if (
          (currentPage === 1 && e.translationX > 0) ||
          (currentPage === totalPages && e.translationX < 0)
        ) {
          swipeTranslateX.value = e.translationX * 0.3;
        } else {
          swipeTranslateX.value = e.translationX;
        }
      }
    })
    .onEnd((e) => {
      if (isSwipeInProgress.value) {
        isSwipeInProgress.value = false;

        // 스와이프 효과로 페이지 변경
        if (e.translationX < -80 && currentPage < totalPages) {
          // 진동 효과
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(handlePageChange)(currentPage + 1);
        } else if (e.translationX > 80 && currentPage > 1) {
          // 진동 효과
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(handlePageChange)(currentPage - 1);
        }

        swipeTranslateX.value = 0;
      }
    });

  // 애니메이션 스타일
  const pageAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: swipeTranslateX.value }],
    };
  });

  // 테마 스타일 useMemo로 최적화
  const themeStyles = useMemo(() => {
    const theme = THEMES.find((t) => t.value === textViewerOptions.theme);
    if (theme) {
      return { backgroundColor: theme.bgColor, textColor: theme.textColor };
    }
    return {
      backgroundColor: textViewerOptions.backgroundColor,
      textColor: textViewerOptions.textColor,
    };
  }, [textViewerOptions]);

  // 설정 섹션 useMemo로 최적화
  const sections: SettingsSection[] = useMemo(
    () => [
      {
        title: '테마',
        data: [
          {
            key: 'theme',
            type: 'button-group',
            value: textViewerOptions.theme,
            label: '테마',
            options: THEMES.map((t) => ({ value: t.value, label: t.label })),
          },
        ],
      },
      {
        title: '글꼴',
        data: [
          {
            key: 'fontFamily',
            type: 'button-group',
            value: textViewerOptions.fontFamily,
            label: '글꼴',
            options: FONTS.map((f) => ({ value: f.value, label: f.label })),
          },
        ],
      },
      {
        title: '글자 크기',
        data: [
          {
            key: 'fontSize',
            type: 'slider',
            value: textViewerOptions.fontSize,
            label: '글자 크기',
            min: 12,
            max: 28,
            step: 1,
            unit: 'px',
          },
        ],
      },
      {
        title: '줄 간격',
        data: [
          {
            key: 'lineHeight',
            type: 'slider',
            value: textViewerOptions.lineHeight,
            label: '줄 간격',
            min: 1.0,
            max: 2.5,
            step: 0.1,
          },
        ],
      },
      {
        title: '여백',
        data: [
          {
            key: 'marginHorizontal',
            type: 'slider',
            value: textViewerOptions.marginHorizontal,
            label: '여백',
            min: 8,
            max: 40,
            step: 2,
            unit: 'px',
          },
        ],
      },
    ],
    [textViewerOptions],
  );

  // 옵션 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      if (key === 'theme') {
        const themeObj = THEMES.find((t) => t.value === value);
        updateTextViewerOptions({
          theme: value,
          backgroundColor: themeObj?.bgColor,
          textColor: themeObj?.textColor,
        });
      } else if (key === 'marginHorizontal') {
        updateTextViewerOptions({ marginHorizontal: value, marginVertical: value });
      } else {
        updateTextViewerOptions({ [key]: value });
      }
    },
    [updateTextViewerOptions],
  );

  // 페이지 렌더링 함수
  const renderPage = useCallback(
    ({ item }: { item: Page }) => {
      return (
        <View
          style={[
            styles.pageContainer,
            {
              width: SCREEN_WIDTH,
              paddingHorizontal: textViewerOptions.marginHorizontal,
              paddingVertical: textViewerOptions.marginVertical,
              backgroundColor: themeStyles.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.text,
              {
                fontFamily: textViewerOptions.fontFamily,
                fontSize: textViewerOptions.fontSize,
                lineHeight: textViewerOptions.fontSize * textViewerOptions.lineHeight,
                color: themeStyles.textColor,
              },
            ]}
          >
            {item.text}
          </Text>
        </View>
      );
    },
    [
      textViewerOptions.marginHorizontal,
      textViewerOptions.marginVertical,
      textViewerOptions.fontFamily,
      textViewerOptions.fontSize,
      textViewerOptions.lineHeight,
      themeStyles.backgroundColor,
      themeStyles.textColor,
    ],
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeStyles.backgroundColor }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={[styles.statusText, { color: themeStyles.textColor }]}>
          텍스트 파일을 불러오는 중...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeStyles.backgroundColor }]}>
        <Text style={[styles.statusText, { color: themeStyles.textColor, marginBottom: 20 }]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTextContent}>
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: '#757575', marginTop: 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 이제 스크롤 모드 렌더링이 불필요하므로 항상 페이지 모드로 렌더링
  return (
    <>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
          <GestureDetector gesture={swipeGesture}>
            <Animated.View style={[styles.container, pageAnimStyle]}>
              <FlatList
                ref={flatListRef}
                data={pages}
                renderItem={renderPage}
                keyExtractor={(item) => `page-${item.index}`}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={currentPage - 1}
                getItemLayout={(_, index) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * index,
                  index,
                })}
                onMomentumScrollEnd={handleScroll}
                scrollEnabled={!isSwipeInProgress.value}
                onScrollToIndexFailed={() => {
                  // 초기 스크롤 실패 시 한 번 더 시도
                  setTimeout(() => {
                    if (flatListRef.current) {
                      flatListRef.current.scrollToIndex({
                        index: 0,
                        animated: false,
                      });
                    }
                  }, 100);
                }}
              />
            </Animated.View>
          </GestureDetector>

          <Overlay
            visible={overlayVisible}
            onBack={() => navigation.goBack()}
            onSettings={() => setSettingsVisible(true)}
            showSlider={totalPages > 1}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </View>
      </TouchableWithoutFeedback>
      <SettingsBottomSheet
        title="텍스트 설정"
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
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  pageContainer: {
    padding: 16,
    justifyContent: 'flex-start',
    height: SCREEN_HEIGHT,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
