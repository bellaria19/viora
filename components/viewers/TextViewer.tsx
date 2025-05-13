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
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 상수 정의 - SafeAreaView를 사용하므로 패딩 필요 없음
const OVERLAY_HEIGHT = 48; // Overlay 컴포넌트의 높이 (대략적인 값)

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
  const insets = useSafeAreaInsets();

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

    try {
      // 폰트 크기 및 화면 크기 기반 계산
      const fontSize = textViewerOptions.fontSize;
      const lineHeight = textViewerOptions.lineHeight;
      const marginHorizontal = textViewerOptions.marginHorizontal;
      const marginVertical = textViewerOptions.marginVertical;

      // 화면에 표시할 수 있는 텍스트 양 계산
      // 한 줄당 글자 수 × 화면에 표시할 수 있는 줄 수
      const avgCharWidth = fontSize * 0.55;
      const contentWidth = SCREEN_WIDTH - marginHorizontal * 2;
      const charsPerLine = Math.floor(contentWidth / avgCharWidth);

      const contentHeight = SCREEN_HEIGHT - marginVertical * 2;
      const lineHeightPx = fontSize * lineHeight;
      const linesPerPage = Math.floor(contentHeight / lineHeightPx);

      // 페이지당 글자 수 계산
      const charsPerPage = charsPerLine * linesPerPage * 0.9; // 10% 여유 공간

      // console.log(
      //   `페이지당 글자 수: ${charsPerPage} (줄당 ${charsPerLine}글자 × ${linesPerPage}줄 × 0.9)`,
      // );

      // 글자 단위로 페이지 분할
      const pageTexts: Page[] = [];
      let remainingText = content;
      let pageIndex = 0;

      while (remainingText.length > 0) {
        let pageEnd = Math.min(remainingText.length, charsPerPage);

        // 페이지의 끝이 단어 중간에 있지 않도록 조정
        if (pageEnd < remainingText.length) {
          // 가장 가까운 줄바꿈이나 공백 찾기
          const lastNewLine = remainingText.lastIndexOf('\n', pageEnd);
          const lastSpace = remainingText.lastIndexOf(' ', pageEnd);

          // 줄바꿈과 공백 중 페이지 끝에 더 가까운 것 선택
          let cutPoint = -1;

          // 공백이 있고 페이지 끝에서 합리적인 거리에 있다면 해당 위치에서 자르기
          if (lastSpace > 0 && pageEnd - lastSpace < 100) {
            cutPoint = lastSpace;
          }

          // 줄바꿈이 있고 공백보다 페이지 끝에 더 가깝다면 해당 위치에서 자르기
          if (lastNewLine > 0 && (cutPoint === -1 || lastNewLine > lastSpace)) {
            cutPoint = lastNewLine;
          }

          // 적합한 자르기 위치가 있다면 페이지 끝 조정
          if (cutPoint > 0) {
            pageEnd = cutPoint + 1; // 공백이나 줄바꿈 다음 위치
          }
        }

        // 현재 페이지의 텍스트 추출
        const pageText = remainingText.substring(0, pageEnd);

        // 페이지 객체 생성 및 추가
        pageTexts.push({
          index: pageIndex++,
          text: pageText,
        });

        // 남은 텍스트 업데이트
        remainingText = remainingText.substring(pageEnd);

        // 남은 텍스트가 빈 공백이나 줄바꿈으로 시작한다면 제거
        remainingText = remainingText.replace(/^[\s\n]+/, '');
      }

      // console.log(`총 ${pageTexts.length}페이지로 분할됨 (총 ${content.length}자)`);

      // 각 페이지의 글자 수 확인 (디버깅용)
      // if (__DEV__) {
      //   pageTexts.forEach((page, idx) => {
      //     console.log(`페이지 ${idx + 1}: ${page.text.length}자`);
      //   });
      // }

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
    } catch (error) {
      console.error('텍스트 분할 오류:', error);
      // 오류 발생 시 단순 분할 방식으로 폴백
      const simplePages = [{ index: 0, text: content }];
      setPages(simplePages);
      setTotalPages(1);
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

  // 페이지 내용 검증 함수
  const verifyPageContent = useCallback(
    (pages: Page[]) => {
      if (pages.length < 2) return; // 페이지가 하나뿐이면 검증 필요 없음

      // 모든 페이지의 텍스트 길이 합계
      const totalCharsInPages = pages.reduce((total, page) => total + page.text.length, 0);

      // 내용 누락 확인 (원본 텍스트의 95% 이상이 페이지에 포함되어야 함)
      if (totalCharsInPages < content.length * 0.95) {
        console.warn(
          `페이지 내용 검증 실패: 원본 ${content.length}글자, 페이지 합계 ${totalCharsInPages}글자`,
        );

        // 누락된 글자 수
        const missingChars = content.length - totalCharsInPages;
        console.warn(
          `약 ${missingChars}글자가 누락됨 (${((missingChars / content.length) * 100).toFixed(2)}%)`,
        );
      }
    },
    [content],
  );

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

  // 페이지 분할 후 검증
  useEffect(() => {
    if (pages.length > 0) {
      verifyPageContent(pages);
    }
  }, [pages, verifyPageContent]);

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

  // 진동 피드백 실행 (UI 스레드 외부에서 실행)
  const triggerHapticFeedback = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(console.error);
  }, []);

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

  // Reanimated에서 scrollEnabled 속성을 제어하기 위한 상태
  const [flatListScrollEnabled, setFlatListScrollEnabled] = useState(true);

  // isSwipeInProgress가 변경될 때 ScrollEnabled 상태 업데이트
  useAnimatedReaction(
    () => isSwipeInProgress.value,
    (inProgress) => {
      runOnJS(setFlatListScrollEnabled)(!inProgress);
    },
  );

  // 스와이프 제스처
  const swipeGesture = Gesture.Pan()
    .onBegin(() => {
      isSwipeInProgress.value = true;
      swipeTranslateX.value = 0;
    })
    .onUpdate((e) => {
      // 첫 페이지에서 오른쪽으로 스와이프하거나 마지막 페이지에서 왼쪽으로 스와이프할 때 저항 추가
      if (
        (currentPage === 1 && e.translationX > 0) ||
        (currentPage === totalPages && e.translationX < 0)
      ) {
        swipeTranslateX.value = e.translationX * 0.3;
      } else {
        swipeTranslateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      isSwipeInProgress.value = false;

      // 스와이프 효과로 페이지 변경
      if (e.translationX < -80 && currentPage < totalPages) {
        // UI 스레드가 아닌 JS 스레드에서 Haptics 호출
        runOnJS(triggerHapticFeedback)();
        runOnJS(handlePageChange)(currentPage + 1);
      } else if (e.translationX > 80 && currentPage > 1) {
        // UI 스레드가 아닌 JS 스레드에서 Haptics 호출
        runOnJS(triggerHapticFeedback)();
        runOnJS(handlePageChange)(currentPage - 1);
      }

      swipeTranslateX.value = 0;
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
            type: 'stepper',
            value: textViewerOptions.fontSize,
            label: '글자 크기',
            min: 16,
            max: 34,
            step: 2,
            unit: 'px',
          },
        ],
      },
      {
        title: '줄 간격',
        data: [
          {
            key: 'lineHeight',
            type: 'stepper',
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
            type: 'stepper',
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
            allowFontScaling={false}
            testID={`page-${item.index}`} // 디버깅을 위한 테스트 ID 추가
          >
            {item.text}
          </Text>
          {/* 디버깅용 페이지 번호 표시 */}
          {__DEV__ && (
            <Text style={styles.debugPageNumber}>
              Page {item.index + 1}/{totalPages}
            </Text>
          )}
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
      totalPages,
    ],
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.backgroundColor }}>
        <View style={[styles.centerContainer, { backgroundColor: themeStyles.backgroundColor }]}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={[styles.statusText, { color: themeStyles.textColor }]}>
            텍스트 파일을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.backgroundColor }}>
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
      </SafeAreaView>
    );
  }

  // 이제 스크롤 모드 렌더링이 불필요하므로 항상 페이지 모드로 렌더링
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.backgroundColor }}>
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
                scrollEnabled={flatListScrollEnabled}
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
    </SafeAreaView>
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
  debugPageNumber: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: 'white',
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
  },
});
