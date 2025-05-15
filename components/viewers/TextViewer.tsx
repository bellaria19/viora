import Overlay from '@/components/common/Overlay';
import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { FONTS, THEMES } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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
  const flatListRef = useRef<any>(null);
  const navigation = useNavigation();
  const { textViewerOptions, updateTextViewerOptions } = useViewerSettings();
  const insets = useSafeAreaInsets();
  const [isSliderActive, setIsSliderActive] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 스와이프 애니메이션 변수
  const swipeTranslateX = useSharedValue(0);
  const isSwipeInProgress = useSharedValue(false);

  // 동적 페이지 분할 관련 상태
  const [measuring, setMeasuring] = useState(false);
  const [measureText, setMeasureText] = useState('');
  const [measureStartIdx, setMeasureStartIdx] = useState(0);
  const [tempPages, setTempPages] = useState<Page[]>([]);
  const [measureReady, setMeasureReady] = useState(false);

  // 한 페이지에 들어갈 수 있는 최대 줄 수 계산
  const fontSize = textViewerOptions.fontSize;
  const lineHeight = textViewerOptions.lineHeight;
  const marginHorizontal = textViewerOptions.marginHorizontal;
  const marginVertical = textViewerOptions.marginVertical;
  const safeAreaVertical = insets.top + insets.bottom;
  const contentHeight = SCREEN_HEIGHT - marginVertical * 2 - safeAreaVertical;
  const lineHeightPx = fontSize * lineHeight;
  const maxLinesPerPage = Math.floor(contentHeight / lineHeightPx);
  const contentWidth = SCREEN_WIDTH - marginHorizontal * 2;

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

  // 동적 페이지 분할 시작
  const startDynamicSplit = useCallback(() => {
    // 옵션 변경 시 분할 관련 상태 완전 초기화
    setMeasuring(false);
    setPages([]);
    setTempPages([]);
    setMeasureText('');
    setMeasureStartIdx(0);
    setTotalPages(1);
    setCurrentPage(1);
    setTimeout(() => {
      if (!content) {
        setPages([{ index: 0, text: content }]);
        return;
      }
      setMeasuring(true);
      setMeasureReady(true);
    }, 0);
  }, [
    content,
    textViewerOptions.fontSize,
    textViewerOptions.lineHeight,
    textViewerOptions.marginHorizontal,
    textViewerOptions.marginVertical,
  ]);

  // 실제 줄 수 측정 및 분할 진행
  const handleTextLayout = useCallback(
    (e: any) => {
      if (!measuring) return;
      const lines = e.nativeEvent.lines;
      if (lines.length <= maxLinesPerPage) {
        let nextLen = measureText.length + 40;
        if (measureStartIdx + nextLen >= content.length) {
          // 분할 완료 시 index를 0부터 다시 부여
          const allPages = [
            ...tempPages,
            { index: tempPages.length, text: content.slice(measureStartIdx) },
          ];
          const reindexedPages = allPages.map((p, i) => ({ ...p, index: i }));
          setMeasuring(false);
          setMeasureReady(false);
          setPages(reindexedPages);
          setTotalPages(reindexedPages.length);
          setCurrentPage(1);
          return;
        }
        setMeasureText(content.slice(measureStartIdx, measureStartIdx + nextLen));
      } else {
        let lastLen = measureText.length - 40;
        if (lastLen <= 0) lastLen = 1;
        const pageText = content.slice(measureStartIdx, measureStartIdx + lastLen);
        const lastSpaceIdx = Math.max(
          pageText.lastIndexOf(' '),
          pageText.lastIndexOf('\n'),
          pageText.lastIndexOf('\t'),
        );
        let cutLen = lastLen;
        if (lastSpaceIdx > 10) {
          cutLen = lastSpaceIdx + 1;
        }
        setTempPages((prev) => [
          ...prev,
          { index: prev.length, text: content.slice(measureStartIdx, measureStartIdx + cutLen) },
        ]);
        setMeasureStartIdx(measureStartIdx + cutLen);
        setMeasureText('');
        setTimeout(() => {
          setMeasureText(content.slice(measureStartIdx + cutLen, measureStartIdx + cutLen + 40));
        }, 0);
      }
    },
    [measuring, measureText, measureStartIdx, content, maxLinesPerPage, tempPages],
  );

  // 측정 시작 트리거
  useEffect(() => {
    if (measureReady) {
      setMeasureText(content.slice(0, 100));
    }
  }, [measureReady, content]);

  // 옵션/텍스트 변경 시 분할 재시작
  useEffect(() => {
    startDynamicSplit();
  }, [
    content,
    textViewerOptions.fontSize,
    textViewerOptions.lineHeight,
    textViewerOptions.marginHorizontal,
    textViewerOptions.marginVertical,
    insets,
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
    verifyPageContent(pages);
  }, [pages, verifyPageContent]);

  // 페이지 변경 처리
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) {
        return;
      }

      // 슬라이더 조작 플래그 설정
      setIsSliderActive(true);

      // 이전 타임아웃 취소
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      setCurrentPage(page);
      updateTextViewerOptions({ lastPage: page });

      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: page - 1,
          animated: false,
        });
      }

      // 스크롤 조작 후 일정 시간이 지나면 슬라이더 조작 플래그 해제
      scrollTimeoutRef.current = setTimeout(() => {
        setIsSliderActive(false);
      }, 300); // 스크롤 애니메이션 완료 예상 시간 이후로 설정
    },
    [totalPages, updateTextViewerOptions],
  );

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    (event: any) => {
      // 슬라이더 조작 중에는 스크롤 이벤트에 의한 페이지 변경 무시
      if (isSliderActive) return;

      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.floor(offsetX / SCREEN_WIDTH) + 1;

      if (page !== currentPage) {
        setCurrentPage(page);
        updateTextViewerOptions({ lastPage: page });
      }
    },
    [currentPage, updateTextViewerOptions, isSliderActive],
  );

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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
        runOnJS(handlePageChange)(currentPage + 1);
      } else if (e.translationX > 80 && currentPage > 1) {
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
        title: '글꼴 설정',
        data: [
          {
            key: 'fontFamily',
            type: 'button-group',
            value: textViewerOptions.fontFamily,
            label: '글꼴',
            options: FONTS.map((f) => ({ value: f.value, label: f.label })),
          },
          //   {
          //     key: 'fontSize',
          //     type: 'stepper',
          //     value: textViewerOptions.fontSize,
          //     label: '글자 크기',
          //     min: 16,
          //     max: 34,
          //     step: 2,
          //     unit: 'px',
          //   },
          //   {
          //     key: 'lineHeight',
          //     type: 'stepper',
          //     value: textViewerOptions.lineHeight,
          //     label: '줄 간격',
          //     min: 1.0,
          //     max: 2.5,
          //     step: 0.1,
          //   },
        ],
      },
      {
        title: '텍스트 표시',
        data: [
          {
            key: 'theme',
            type: 'button-group',
            value: textViewerOptions.theme,
            label: '테마',
            options: THEMES.map((t) => ({ value: t.value, label: t.label })),
          },
          {
            key: 'textColor',
            type: 'color-group',
            value: textViewerOptions.textColor,
            label: '글자 색상',
            colorOptions: ['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent'],
          },
          {
            key: 'backgroundColor',
            type: 'color-group',
            value: textViewerOptions.backgroundColor,
            label: '배경 색상',
            colorOptions: ['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent'],
          },
        ],
      },
      // {
      //   title: '여백',
      //   data: [
      //     {
      //       key: 'marginHorizontal',
      //       type: 'stepper',
      //       value: textViewerOptions.marginHorizontal,
      //       label: '가로 여백',
      //       min: 0,
      //       max: 40,
      //       step: 2,
      //       unit: 'px',
      //     },
      //     {
      //       key: 'marginVertical',
      //       type: 'stepper',
      //       value: textViewerOptions.marginVertical,
      //       label: '세로 여백',
      //       min: 0,
      //       max: 40,
      //       step: 2,
      //       unit: 'px',
      //     },
      //   ],
      // },
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
        updateTextViewerOptions({ marginHorizontal: value });
      } else if (key === 'marginVertical') {
        updateTextViewerOptions({ marginVertical: value });
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
            style={{
              fontFamily: textViewerOptions.fontFamily,
              fontSize: textViewerOptions.fontSize,
              lineHeight: textViewerOptions.fontSize * textViewerOptions.lineHeight,
              color: themeStyles.textColor,
            }}
            allowFontScaling={false}
            testID={`page-${item.index}`} // 디버깅을 위한 테스트 ID 추가
          >
            {item.text}
          </Text>
          {/* 디버깅용 페이지 번호 표시 */}
          {/* {__DEV__ && (
            <Text style={styles.debugPageNumber}>
              Page {item.index + 1}/{totalPages}
            </Text>
          )} */}
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

  // if (measuring) {
  //   return (
  //     <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.backgroundColor }}>
  //       <View style={[styles.centerContainer, { backgroundColor: themeStyles.backgroundColor }]}>
  //         <ActivityIndicator size="large" color="#2196F3" />
  //         <Text style={[styles.statusText, { color: themeStyles.textColor }]}>
  //           텍스트 파일을 불러오는 중...
  //         </Text>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

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

  // 기존 FlatList 위에 측정용 Text 추가
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.backgroundColor }}>
      {/* 실제 측정용 Text (숨김) */}
      {measuring && (
        <Text
          style={{
            position: 'absolute',
            opacity: 0,
            fontSize: fontSize,
            lineHeight: fontSize * lineHeight,
            width: contentWidth,
            fontFamily: textViewerOptions.fontFamily,
            left: -9999,
            top: -9999,
          }}
          onTextLayout={handleTextLayout}
        >
          {measureText}
        </Text>
      )}
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
          <GestureDetector gesture={swipeGesture}>
            <Animated.View style={[styles.container, pageAnimStyle]}>
              <FlashList
                ref={flatListRef}
                data={pages}
                renderItem={renderPage}
                keyExtractor={(item) =>
                  `page-${item.index}-${textViewerOptions.fontSize}-${textViewerOptions.lineHeight}-${textViewerOptions.marginHorizontal}-${textViewerOptions.marginVertical}`
                }
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={currentPage - 1}
                estimatedItemSize={SCREEN_WIDTH}
                getItemType={() => 'page'}
                onMomentumScrollEnd={handleScroll}
                scrollEnabled={flatListScrollEnabled}
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
  pageContainer: {
    justifyContent: 'flex-start',
    height: SCREEN_HEIGHT,
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
