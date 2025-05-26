import { getTextSections } from '@/app/settings/sections/textSections';
import { Overlay, SettingsBottomSheet } from '@/components/common';
import ViewerLoading from '@/components/viewers/ViewerLoading';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

interface TextViewerProps {
  uri: string;
}

interface WebViewMessage {
  type: 'ready' | 'pageChange' | 'totalPages' | 'error' | 'log' | 'scrollPosition';
  data?: any;
  message?: string;
}

export default function TextViewer({ uri }: TextViewerProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [webViewReady, setWebViewReady] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();
  const { textViewerOptions, updateTextViewerOptions } = useViewerSettings();

  // 뷰 모드 (page 또는 scroll)
  const viewMode = textViewerOptions.viewMode || 'scroll';
  const isPageMode = viewMode === 'page';

  // 텍스트 파일 불러오기
  const loadTextContent = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [uri]);

  // 테마 스타일 계산
  const themeStyles = useMemo(
    () => ({
      backgroundColor: textViewerOptions.backgroundColor,
      textColor: textViewerOptions.textColor,
    }),
    [textViewerOptions],
  );

  // HTML 템플릿 생성
  const htmlContent = useMemo(() => {
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\n/g, '<br>');

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Text Viewer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${
              textViewerOptions.fontFamily === 'System'
                ? '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui'
                : textViewerOptions.fontFamily === 'NotoSansKR'
                  ? "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
                  : textViewerOptions.fontFamily === 'Inter'
                    ? "'Inter', sans-serif"
                    : textViewerOptions.fontFamily === 'Pretendard'
                      ? "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
                      : textViewerOptions.fontFamily
            };
            font-size: ${textViewerOptions.fontSize}px;
            line-height: ${textViewerOptions.lineHeight};
            color: ${themeStyles.textColor};
            background-color: ${themeStyles.backgroundColor};
            overflow-x: hidden;
            word-wrap: break-word;
            white-space: pre-wrap;
            -webkit-text-size-adjust: 100%;
            font-weight: ${parseInt((textViewerOptions.fontWeight || '400').toString(), 10)};
        }
        
        #container {
            padding: ${textViewerOptions.marginVertical}px ${textViewerOptions.marginHorizontal}px;
        }
        
        /* 스크롤 모드 스타일 */
        .scroll-mode {
            min-height: 100vh;
        }
        
        .scroll-mode #content {
            padding-bottom: 100px; /* 마지막 내용이 잘리지 않도록 */
        }
        
        /* 페이지 모드 스타일 */
        .page-mode {
            height: 100vh;
            overflow: hidden;
        }
        
        .page-mode #container {
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .page-mode #content {
            flex: 1;
            overflow: hidden;
            display: flex;
            align-items: flex-start;
            padding-bottom: 40px; /* 페이지 번호 공간 */
        }
        
        .page-content {
            width: 100%;
            line-height: ${textViewerOptions.lineHeight};
        }
        
        .page-number {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            opacity: 0.7;
            background: rgba(128,128,128,0.2);
            padding: 4px 8px;
            border-radius: 4px;
            z-index: 1000;
        }
        
        /* 페이지 전환 애니메이션 */
        .page-transition {
            transition: opacity 0.2s ease-in-out;
        }
        
        .page-fade {
            opacity: 0.3;
        }
    </style>
</head>
<body class="${isPageMode ? 'page-mode' : 'scroll-mode'}">
    <div id="container">
        <div id="content">
            <div class="page-content" id="pageContent">
                ${escapedContent}
            </div>
        </div>
        ${isPageMode ? '<div class="page-number" id="pageNumber">1 / 1</div>' : ''}
    </div>
    
    <script>
    let currentPage = 1;
    let totalPages = 1;
    let isPageMode = ${isPageMode};
    let pages = [];
    let originalContent = \`${escapedContent}\`;
    let pageHeight = 0;
    let lineHeight = 0;
    
    // React Native로 메시지 전송
    function sendMessage(type, data = null, message = null) {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type,
                data,
                message
            }));
        }
    }
    
    // 로그 함수
    function log(message) {
        console.log(message);
        sendMessage('log', null, message);
    }
    
    // 페이지 높이와 줄 높이 정확히 계산
    function calculateDimensions() {
        const container = document.getElementById('container');
        const containerRect = container.getBoundingClientRect();
        const containerStyle = getComputedStyle(container);
        
        const paddingTop = parseInt(containerStyle.paddingTop) || 0;
        const paddingBottom = parseInt(containerStyle.paddingBottom) || 0;
        
        // 페이지 번호 공간 제외
        pageHeight = window.innerHeight - paddingTop - paddingBottom - 60;
        
        // 실제 줄 높이 측정
        const tempSpan = document.createElement('span');
        tempSpan.innerHTML = 'A<br>B';
        tempSpan.style.fontSize = getComputedStyle(document.body).fontSize;
        tempSpan.style.lineHeight = getComputedStyle(document.body).lineHeight;
        tempSpan.style.fontFamily = getComputedStyle(document.body).fontFamily;
        tempSpan.style.position = 'absolute';
        tempSpan.style.visibility = 'hidden';
        document.body.appendChild(tempSpan);
        
        lineHeight = tempSpan.offsetHeight / 2; // 두 줄이므로 2로 나누기
        document.body.removeChild(tempSpan);
        
        log(\`화면 크기: \${window.innerWidth}x\${window.innerHeight}\`);
        log(\`페이지 높이: \${pageHeight}px, 줄 높이: \${lineHeight}px\`);
    }
    
    // 개선된 페이지 분할 함수
    function splitIntoPages() {
        if (!isPageMode) {
            totalPages = 1;
            currentPage = 1;
            return;
        }
        
        calculateDimensions();
        
        if (lineHeight <= 0) {
            log('줄 높이 계산 실패, 기본값 사용');
            lineHeight = 24; // 기본값
        }
        
        // 한 페이지에 들어갈 수 있는 줄 수
        const linesPerPage = Math.floor(pageHeight / lineHeight);
        log(\`페이지당 줄 수: \${linesPerPage}\`);
        
        if (linesPerPage <= 0) {
            totalPages = 1;
            pages = [originalContent];
            log('페이지당 줄 수가 0 이하, 전체를 1페이지로 설정');
        } else {
            // 텍스트를 줄 단위로 분할
            const lines = originalContent.split('<br>');
            pages = [];
            
            for (let i = 0; i < lines.length; i += linesPerPage) {
                const pageLines = lines.slice(i, i + linesPerPage);
                pages.push(pageLines.join('<br>'));
            }
            
            // 빈 페이지 제거
            pages = pages.filter(page => page.trim().length > 0);
            totalPages = Math.max(1, pages.length);
        }
        
        // 현재 페이지가 범위를 벗어나면 조정
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        if (currentPage < 1) {
            currentPage = 1;
        }
        
        log(\`=== 페이지 분할 결과 ===\`);
        log(\`전체 줄 수: \${originalContent.split('<br>').length}\`);
        log(\`전체 페이지 수: \${totalPages}\`);
        log(\`현재 페이지: \${currentPage}\`);
        log(\`페이지별 내용 길이: \${pages.map(p => p.length).join(', ')}\`);
        log(\`======================\`);
        
        sendMessage('totalPages', totalPages);
        updatePageDisplay();
    }
    
    // 페이지 표시 업데이트
    function updatePageDisplay() {
        const pageContent = document.getElementById('pageContent');
        const pageNumber = document.getElementById('pageNumber');
        
        if (isPageMode) {
            if (pages.length > 0 && currentPage >= 1 && currentPage <= pages.length) {
                const content = pages[currentPage - 1] || '';
                pageContent.innerHTML = content;
                log(\`페이지 \${currentPage} 표시 (길이: \${content.length})\`);
            } else {
                pageContent.innerHTML = originalContent;
                log(\`페이지 범위 오류, 전체 내용 표시\`);
            }
            
            if (pageNumber) {
                pageNumber.textContent = \`\${currentPage} / \${totalPages}\`;
            }
        } else {
            pageContent.innerHTML = originalContent;
        }
        
        sendMessage('pageChange', currentPage);
    }
    
    // 페이지 이동 함수 개선
    function goToPage(page) {
        if (!isPageMode) {
            log('페이지 모드가 아님, 이동 무시');
            return;
        }
        
        log(\`페이지 이동 요청: \${currentPage} → \${page} (총 \${totalPages}페이지)\`);
        
        if (page >= 1 && page <= totalPages) {
            // 페이지 전환 애니메이션
            const content = document.getElementById('content');
            content.classList.add('page-transition', 'page-fade');
            
            setTimeout(() => {
                currentPage = page;
                updatePageDisplay();
                content.classList.remove('page-fade');
                
                setTimeout(() => {
                    content.classList.remove('page-transition');
                }, 200);
                
                log(\`페이지 \${page}로 이동 완료\`);
            }, 100);
        } else {
            log(\`잘못된 페이지 번호: \${page} (유효 범위: 1-\${totalPages})\`);
        }
    }
    
    // 뷰 모드 변경
    function setViewMode(mode) {
        const body = document.body;
        const pageNumber = document.getElementById('pageNumber');
        
        log(\`뷰 모드 변경: \${isPageMode ? 'page' : 'scroll'} → \${mode}\`);
        
        isPageMode = (mode === 'page');
        
        if (isPageMode) {
            body.className = 'page-mode';
            if (!pageNumber) {
                const newPageNumber = document.createElement('div');
                newPageNumber.className = 'page-number';
                newPageNumber.id = 'pageNumber';
                document.body.appendChild(newPageNumber);
            }
            splitIntoPages();
        } else {
            body.className = 'scroll-mode';
            if (pageNumber) {
                pageNumber.remove();
            }
            totalPages = 1;
            currentPage = 1;
            updatePageDisplay();
            sendMessage('totalPages', 1);
            sendMessage('pageChange', 1);
        }
    }
    
    // 설정 업데이트
    function updateSettings(options) {
        const body = document.body;
        const container = document.getElementById('container');
        
        let needsReflow = false;
        
        if (options.fontSize) {
            body.style.fontSize = options.fontSize + 'px';
            needsReflow = true;
        }
        
        if (options.lineHeight) {
            body.style.lineHeight = options.lineHeight;
            needsReflow = true;
        }
        
        if (options.fontFamily) {
            body.style.fontFamily = options.fontFamily === 'System' 
                ? '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui'
                : options.fontFamily;
            needsReflow = true;
        }
        
        if (options.textColor) {
            body.style.color = options.textColor;
        }
        
        if (options.backgroundColor) {
            body.style.backgroundColor = options.backgroundColor;
        }
        
        if (options.marginHorizontal !== undefined) {
            container.style.paddingLeft = options.marginHorizontal + 'px';
            container.style.paddingRight = options.marginHorizontal + 'px';
            needsReflow = true;
        }
        
        if (options.marginVertical !== undefined) {
            container.style.paddingTop = options.marginVertical + 'px';
            container.style.paddingBottom = options.marginVertical + 'px';
            needsReflow = true;
        }
        
        if (options.viewMode) {
            setViewMode(options.viewMode);
            return;
        }
        
        if (options.fontWeight) {
            body.style.fontWeight = parseInt(options.fontWeight, 10);
        }
        
        // 페이지 모드에서 레이아웃 관련 설정이 변경되면 다시 분할
        if (isPageMode && needsReflow) {
            log('설정 변경으로 인한 페이지 재분할');
            setTimeout(() => {
                splitIntoPages();
            }, 100);
        }
    }
    
    // 터치 이벤트 처리 개선
    let startX = 0;
    let startY = 0;
    
    function handleTouchStart(e) {
        if (!isPageMode) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e) {
        if (!isPageMode) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // 수평 스와이프가 수직 스와이프보다 클 때만 페이지 넘김
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0 && currentPage < totalPages) {
                log('스와이프: 다음 페이지');
                goToPage(currentPage + 1);
            } else if (diffX < 0 && currentPage > 1) {
                log('스와이프: 이전 페이지');
                goToPage(currentPage - 1);
            }
        }
    }
    
    // 이벤트 리스너 등록
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // 창 크기 변경 시 페이지 재계산
    window.addEventListener('resize', function() {
        if (isPageMode) {
            log('화면 크기 변경, 페이지 재분할');
            setTimeout(() => {
                splitIntoPages();
            }, 100);
        }
    });
    
    // 초기화
    document.addEventListener('DOMContentLoaded', function() {
        log('WebView 초기화 시작');
        
        // 초기 페이지 설정
        const lastPage = ${textViewerOptions.lastPage || 1};
        currentPage = lastPage;
        
        if (isPageMode) {
            log('페이지 모드로 초기화');
            splitIntoPages();
        } else {
            log('스크롤 모드로 초기화');
            sendMessage('totalPages', 1);
            sendMessage('pageChange', 1);
        }
        
        sendMessage('ready');
    });
    
    // React Native에서 오는 메시지 처리
    document.addEventListener('message', function(event) {
        try {
            const message = JSON.parse(event.data);
            log(\`메시지 수신: \${message.type}\`);
            
            switch (message.type) {
                case 'goToPage':
                    goToPage(message.data);
                    break;
                case 'updateSettings':
                    updateSettings(message.data);
                    break;
            }
        } catch (e) {
            log('메시지 처리 오류: ' + e.message);
        }
    });
    
    // 전역 함수로 노출 (디버깅용)
    window.textViewer = {
        goToPage,
        setViewMode,
        updateSettings,
        getCurrentPage: () => currentPage,
        getTotalPages: () => totalPages,
        isPageMode: () => isPageMode,
        getPages: () => pages,
        splitIntoPages
    };
    </script>
</body>
</html>
    `;
  }, [content, textViewerOptions, themeStyles, isPageMode]);

  // WebView 메시지 처리
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const message: WebViewMessage = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case 'ready':
            setWebViewReady(true);
            setIsLoading(false);
            console.log('🟢 WebView 준비 완료');
            break;

          case 'pageChange':
            if (typeof message.data === 'number') {
              console.log(`📄 페이지 변경: ${currentPage} → ${message.data}`);
              setCurrentPage(message.data);
              updateTextViewerOptions({ lastPage: message.data });
            }
            break;

          case 'totalPages':
            if (typeof message.data === 'number') {
              console.log(`📊 총 페이지 수: ${message.data}`);
              setTotalPages(message.data);
            }
            break;

          case 'log':
            console.log('[WebView]', message.message);
            break;

          case 'error':
            console.error('❌ WebView 오류:', message.message);
            setError(message.message || '웹뷰에서 오류가 발생했습니다.');
            break;
        }
      } catch (e) {
        console.error('WebView 메시지 파싱 오류:', e);
      }
    },
    [currentPage, updateTextViewerOptions],
  );

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      if (!isPageMode) {
        console.log('🚫 스크롤 모드에서는 페이지 변경 불가');
        return;
      }
      if (page < 1 || page > totalPages) {
        console.log(`🚫 잘못된 페이지 번호: ${page} (범위: 1-${totalPages})`);
        return;
      }

      console.log(`🎯 페이지 변경 요청: ${currentPage} → ${page}`);
      setCurrentPage(page);
      updateTextViewerOptions({ lastPage: page });

      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'goToPage',
          data: page,
        }),
      );
    },
    [isPageMode, totalPages, currentPage, updateTextViewerOptions],
  );

  // 설정 변경 시 WebView에 전송
  useEffect(() => {
    if (webViewReady && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'updateSettings',
          data: textViewerOptions,
        }),
      );
    }
  }, [textViewerOptions, webViewReady]);

  // 설정 섹션
  const sections = useMemo(() => getTextSections(textViewerOptions), [textViewerOptions]);

  // 옵션 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updateTextViewerOptions({ [key]: value });
    },
    [updateTextViewerOptions],
  );

  useEffect(() => {
    loadTextContent();
  }, [loadTextContent]);

  if (isLoading && !content) {
    return <ViewerLoading message="텍스트 파일을 불러오는 중..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={{ flex: 1, backgroundColor: themeStyles.backgroundColor }}>
          {content && (
            <WebView
              ref={webViewRef}
              source={{ html: htmlContent }}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              onMessage={handleWebViewMessage}
              allowsInlineMediaPlayback={false}
              mediaPlaybackRequiresUserAction={false}
              domStorageEnabled={false}
              javaScriptEnabled
              scrollEnabled={!isPageMode} // 페이지 모드에서는 스크롤 비활성화
              showsVerticalScrollIndicator={!isPageMode}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              automaticallyAdjustContentInsets={false}
              contentInsetAdjustmentBehavior="never"
              decelerationRate="normal"
              webviewDebuggingEnabled={true}
            />
          )}

          <Overlay
            visible={overlayVisible}
            onBack={() => navigation.goBack()}
            onSettings={() => setSettingsVisible(true)}
            showSlider={isPageMode && totalPages > 1}
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
