import { Overlay } from '@/components/common';
import SettingBottomSheet from '@/components/settings/SettingBottomSheet';
import ViewerError from '@/components/viewers/ViewerError';
import ViewerLoading from '@/components/viewers/ViewerLoading';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { getTextSections } from '@/utils/sections/textSections';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  const { top: safeAreaTop, bottom: safeAreaBottom } = useSafeAreaInsets();
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

        /* 측정용 숨겨진 엘리먼트 */
        .hidden-measure {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            visibility: hidden;
            z-index: -1;
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
    
    <!-- 실제 렌더링 측정용 숨겨진 컨테이너 -->
    <div id="hiddenContainer" class="hidden-measure">
        <div id="hiddenContent" style="padding: ${textViewerOptions.marginVertical}px ${textViewerOptions.marginHorizontal}px;">
            ${escapedContent}
        </div>
    </div>
    
    <script>
    let currentPage = 1;
    let totalPages = 1;
    let isPageMode = ${isPageMode};
    let pages = [];
    let originalContent = \`${escapedContent}\`;
    let pageBreakPositions = [];
    
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
    
    // 스크롤 기반 페이지 분할 함수
    function splitIntoPagesByScroll() {
        if (!isPageMode) {
            totalPages = 1;
            currentPage = 1;
            return;
        }
        
        log('🔄 스크롤 기반 페이지 분할 시작');
        
        // 측정용 컨테이너 설정
        const hiddenContainer = document.getElementById('hiddenContainer');
        const hiddenContent = document.getElementById('hiddenContent');
        
        // 실제 스크롤 모드 스타일 적용
        hiddenContainer.style.visibility = 'visible';
        hiddenContainer.style.position = 'absolute';
        hiddenContainer.style.top = '0';
        hiddenContainer.style.left = '0';
        hiddenContainer.style.width = '100%';
        hiddenContainer.style.height = 'auto';
        hiddenContainer.style.overflow = 'visible';
        hiddenContainer.style.zIndex = '-1';
        
        // 페이지 높이 계산 (페이지 번호 공간 제외)
        const pageHeight = window.innerHeight - ${textViewerOptions.marginVertical * 2} - 60;
        
        log(\`📏 페이지 높이: \${pageHeight}px\`);
        
        // 전체 컨텐츠의 실제 높이 측정
        const contentHeight = hiddenContent.scrollHeight;
        log(\`📏 전체 컨텐츠 높이: \${contentHeight}px\`);
        
        // 스크롤 위치 기반으로 페이지 분할점 계산
        pageBreakPositions = [];
        let currentScrollTop = 0;
        
        while (currentScrollTop < contentHeight) {
            pageBreakPositions.push(currentScrollTop);
            currentScrollTop += pageHeight;
        }
        
        // 마지막 페이지 처리
        if (pageBreakPositions[pageBreakPositions.length - 1] < contentHeight) {
            pageBreakPositions.push(contentHeight);
        }
        
        totalPages = Math.max(1, pageBreakPositions.length - 1);
        
        log(\`📄 총 페이지 수: \${totalPages}\`);
        log(\`📍 페이지 분할점: \${pageBreakPositions.join(', ')}\`);
        
        // 각 페이지별 콘텐츠 생성
        pages = [];
        for (let i = 0; i < totalPages; i++) {
            const startPos = pageBreakPositions[i];
            const endPos = pageBreakPositions[i + 1] || contentHeight;
            
            // 해당 페이지에 해당하는 콘텐츠 범위 계산
            const pageContent = extractContentByScrollPosition(startPos, endPos, pageHeight);
            pages.push(pageContent);
            
            log(\`📄 페이지 \${i + 1}: \${startPos}-\${endPos}px (길이: \${pageContent.length})\`);
        }
        
        // 현재 페이지가 범위를 벗어나면 조정
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        if (currentPage < 1) {
            currentPage = 1;
        }
        
        // 측정용 컨테이너 숨기기
        hiddenContainer.style.visibility = 'hidden';
        
        sendMessage('totalPages', totalPages);
        updatePageDisplay();
    }
    
    // 스크롤 위치에 따른 콘텐츠 추출
    function extractContentByScrollPosition(startPos, endPos, pageHeight) {
        const hiddenContent = document.getElementById('hiddenContent');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent;
        tempDiv.style.position = 'absolute';
        tempDiv.style.top = '0';
        tempDiv.style.left = '0';
        tempDiv.style.width = '100%';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.padding = \`\${${textViewerOptions.marginVertical}}px \${${textViewerOptions.marginHorizontal}}px\`;
        tempDiv.style.fontSize = '${textViewerOptions.fontSize}px';
        tempDiv.style.lineHeight = '${textViewerOptions.lineHeight}';
        tempDiv.style.fontFamily = getComputedStyle(document.body).fontFamily;
        tempDiv.style.fontWeight = '${textViewerOptions.fontWeight}';
        tempDiv.style.whiteSpace = 'pre-wrap';
        tempDiv.style.wordWrap = 'break-word';
        
        document.body.appendChild(tempDiv);
        
        try {
            // 텍스트 노드들을 순회하면서 스크롤 위치에 맞는 부분 찾기
            const walker = document.createTreeWalker(
                tempDiv,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let accumulatedHeight = 0;
            let pageStartFound = false;
            let pageContent = '';
            let node;
            
            while (node = walker.nextNode()) {
                const textNode = node as Text;
                const parentElement = textNode.parentElement;
                
                if (parentElement) {
                    const rect = parentElement.getBoundingClientRect();
                    const nodeHeight = rect.height;
                    
                    // 시작 위치 찾기
                    if (!pageStartFound && accumulatedHeight + nodeHeight >= startPos) {
                        pageStartFound = true;
                    }
                    
                    // 페이지 내용 수집
                    if (pageStartFound && accumulatedHeight < endPos) {
                        pageContent += textNode.textContent || '';
                        
                        // 페이지 끝에 도달했으면 중단
                        if (accumulatedHeight + nodeHeight >= endPos) {
                            break;
                        }
                    }
                    
                    accumulatedHeight += nodeHeight;
                }
            }
            
            // 내용이 없으면 원본 내용의 일부를 추정으로 가져오기
            if (!pageContent.trim()) {
                const lines = originalContent.split('<br>');
                const linesPerPage = Math.floor(pageHeight / (${textViewerOptions.fontSize} * ${textViewerOptions.lineHeight}));
                const startLine = Math.floor(startPos / (${textViewerOptions.fontSize} * ${textViewerOptions.lineHeight}));
                const endLine = Math.min(lines.length, startLine + linesPerPage);
                
                pageContent = lines.slice(startLine, endLine).join('<br>');
            }
            
            return pageContent;
            
        } finally {
            document.body.removeChild(tempDiv);
        }
    }
    
    // 페이지 표시 업데이트
    function updatePageDisplay() {
        const pageContent = document.getElementById('pageContent');
        const pageNumber = document.getElementById('pageNumber');
        
        if (isPageMode) {
            if (pages.length > 0 && currentPage >= 1 && currentPage <= pages.length) {
                const content = pages[currentPage - 1] || '';
                pageContent.innerHTML = content;
                log(\`📄 페이지 \${currentPage} 표시 (길이: \${content.length})\`);
            } else {
                pageContent.innerHTML = originalContent;
                log(\`⚠️ 페이지 범위 오류, 전체 내용 표시\`);
            }
            
            if (pageNumber) {
                pageNumber.textContent = \`\${currentPage} / \${totalPages}\`;
            }
        } else {
            pageContent.innerHTML = originalContent;
        }
        
        sendMessage('pageChange', currentPage);
    }
    
    // 페이지 이동 함수
    function goToPage(page) {
        if (!isPageMode) {
            log('⚠️ 페이지 모드가 아님, 이동 무시');
            return;
        }
        
        log(\`📍 페이지 이동 요청: \${currentPage} → \${page} (총 \${totalPages}페이지)\`);
        
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
                
                log(\`✅ 페이지 \${page}로 이동 완료\`);
            }, 100);
        } else {
            log(\`❌ 잘못된 페이지 번호: \${page} (유효 범위: 1-\${totalPages})\`);
        }
    }
    
    // 뷰 모드 변경
    function setViewMode(mode) {
        const body = document.body;
        const pageNumber = document.getElementById('pageNumber');
        
        log(\`🔄 뷰 모드 변경: \${isPageMode ? 'page' : 'scroll'} → \${mode}\`);
        
        isPageMode = (mode === 'page');
        
        if (isPageMode) {
            body.className = 'page-mode';
            if (!pageNumber) {
                const newPageNumber = document.createElement('div');
                newPageNumber.className = 'page-number';
                newPageNumber.id = 'pageNumber';
                document.body.appendChild(newPageNumber);
            }
            splitIntoPagesByScroll();
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
        const hiddenContent = document.getElementById('hiddenContent');
        
        let needsReflow = false;
        
        if (options.fontSize) {
            body.style.fontSize = options.fontSize + 'px';
            if (hiddenContent) {
                hiddenContent.style.fontSize = options.fontSize + 'px';
            }
            needsReflow = true;
        }
        
        if (options.lineHeight) {
            body.style.lineHeight = options.lineHeight;
            if (hiddenContent) {
                hiddenContent.style.lineHeight = options.lineHeight;
            }
            needsReflow = true;
        }
        
        if (options.fontFamily) {
            const fontFamily = options.fontFamily === 'System' 
                ? '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui'
                : options.fontFamily;
            body.style.fontFamily = fontFamily;
            if (hiddenContent) {
                hiddenContent.style.fontFamily = fontFamily;
            }
            needsReflow = true;
        }
        
        if (options.textColor) {
            body.style.color = options.textColor;
        }
        
        if (options.backgroundColor) {
            body.style.backgroundColor = options.backgroundColor;
        }
        
        if (options.marginHorizontal !== undefined) {
            const margin = options.marginHorizontal + 'px';
            container.style.paddingLeft = margin;
            container.style.paddingRight = margin;
            if (hiddenContent) {
                hiddenContent.style.paddingLeft = margin;
                hiddenContent.style.paddingRight = margin;
            }
            needsReflow = true;
        }
        
        if (options.marginVertical !== undefined) {
            const margin = options.marginVertical + 'px';
            container.style.paddingTop = margin;
            container.style.paddingBottom = margin;
            if (hiddenContent) {
                hiddenContent.style.paddingTop = margin;
                hiddenContent.style.paddingBottom = margin;
            }
            needsReflow = true;
        }
        
        if (options.viewMode) {
            setViewMode(options.viewMode);
            return;
        }
        
        if (options.fontWeight) {
            const fontWeight = parseInt(options.fontWeight, 10);
            body.style.fontWeight = fontWeight;
            if (hiddenContent) {
                hiddenContent.style.fontWeight = fontWeight;
            }
            needsReflow = true;
        }
        
        // 페이지 모드에서 레이아웃 관련 설정이 변경되면 다시 분할
        if (isPageMode && needsReflow) {
            log('⚡ 설정 변경으로 인한 페이지 재분할');
            setTimeout(() => {
                splitIntoPagesByScroll();
            }, 100);
        }
    }
    
    // 터치 이벤트 처리
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
                log('👉 스와이프: 다음 페이지');
                goToPage(currentPage + 1);
            } else if (diffX < 0 && currentPage > 1) {
                log('👈 스와이프: 이전 페이지');
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
            log('📱 화면 크기 변경, 페이지 재분할');
            setTimeout(() => {
                splitIntoPagesByScroll();
            }, 100);
        }
    });
    
    // 초기화
    document.addEventListener('DOMContentLoaded', function() {
        log('🚀 WebView 초기화 시작');
        
        // 초기 페이지 설정
        const lastPage = ${textViewerOptions.lastPage || 1};
        currentPage = lastPage;
        
        if (isPageMode) {
            log('📄 페이지 모드로 초기화');
            // DOM이 완전히 로드된 후 실행
            setTimeout(() => {
                splitIntoPagesByScroll();
            }, 100);
        } else {
            log('📜 스크롤 모드로 초기화');
            sendMessage('totalPages', 1);
            sendMessage('pageChange', 1);
        }
        
        sendMessage('ready');
    });
    
    // React Native에서 오는 메시지 처리
    document.addEventListener('message', function(event) {
        try {
            const message = JSON.parse(event.data);
            log(\`📨 메시지 수신: \${message.type}\`);
            
            switch (message.type) {
                case 'goToPage':
                    goToPage(message.data);
                    break;
                case 'updateSettings':
                    updateSettings(message.data);
                    break;
            }
        } catch (e) {
            log('❌ 메시지 처리 오류: ' + e.message);
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
        splitIntoPagesByScroll,
        getPageBreakPositions: () => pageBreakPositions
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
    return <ViewerError message={error} />;
  }

  return (
    <View style={{ flex: 1 }}>
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
            onSettings={() => setSettingsVisible(true)}
            showSlider={isPageMode && totalPages > 1}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </View>
      </TouchableWithoutFeedback>

      <SettingBottomSheet
        title="텍스트 설정"
        isVisible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        sections={sections}
        onOptionChange={handleOptionChange}
      />
    </View>
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
