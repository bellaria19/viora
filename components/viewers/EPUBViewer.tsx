import SettingsBottomSheet, { SettingsSection } from '@/components/common/SettingsBottomSheet';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Overlay from '../common/Overlay';

interface EPUBViewerProps {
  uri: string;
}

export default function EPUBViewer({ uri }: EPUBViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();

  // EPUB 뷰어 설정
  const { epubViewerOptions, updateEPUBViewerOptions } = useViewerSettings();

  // 테마에 따른 스타일 계산
  const getBackgroundColor = () => {
    switch (epubViewerOptions.theme) {
      case 'dark':
        return '#1a1a1a';
      case 'sepia':
        return '#f8f1e3';
      default:
        return '#ffffff';
    }
  };

  const getTextColor = () => {
    switch (epubViewerOptions.theme) {
      case 'dark':
        return '#eee';
      case 'sepia':
        return '#5b4636';
      default:
        return '#333';
    }
  };

  useEffect(() => {
    if (webViewRef.current) {
      applySettingsToReader();
    }
  }, [epubViewerOptions]);

  // WebView에 설정 적용
  const applySettingsToReader = () => {
    if (!webViewRef.current) return;

    const js = `
      try {
        if (window.book && window.rendition) {
          // 테마 설정 적용
          const backgroundColor = "${getBackgroundColor()}";
          const textColor = "${getTextColor()}";
          const linkColor = "${epubViewerOptions.linkColor}";
          
          // 글꼴 설정
          const fontFamily = "${epubViewerOptions.fontFamily}";
          const fontSize = ${epubViewerOptions.fontSize};
          const lineHeight = ${epubViewerOptions.lineHeight};
          
          // CSS 추가
          rendition.themes.default({
            body: {
              color: textColor,
              background: backgroundColor,
              font-family: fontFamily,
              font-size: fontSize + "px",
              line-height: lineHeight,
              padding: "${epubViewerOptions.marginVertical}px ${epubViewerOptions.marginHorizontal}px"
            },
            'a': {
              color: linkColor
            }
          });
          
          // 뷰 모드 설정
          const flow = "${epubViewerOptions.viewMode === 'scroll' ? 'scrolled' : 'paginated'}";
          if (currentFlow !== flow) {
            rendition.flow(flow);
            currentFlow = flow;
          }
        }
      } catch (e) {
        console.error('Error applying settings:', e);
      }
      true;
    `;

    webViewRef.current.injectJavaScript(js);
  };

  // HTML 템플릿으로 epub.js를 포함하는 WebView 콘텐츠 생성
  const getHtmlContent = () => {
    // base64로 인코딩된 파일 경로를 사용하여 WebView에서 로드
    const filePathEncoded = `file://${uri}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>EPUB Reader</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/epub.js/0.3.88/epub.min.js"></script>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: ${getBackgroundColor()};
              color: ${getTextColor()};
            }
            #viewer {
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            #area {
              width: 100%;
              height: 100%;
              margin: 0 auto;
            }
            #loading {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: ${getBackgroundColor()};
              color: ${getTextColor()};
              z-index: 999;
            }
          </style>
        </head>
        <body>
          <div id="loading">로딩 중...</div>
          <div id="viewer"></div>
          <script>
            // 전역 변수
            var book, rendition, currentFlow;
            var currentPage = 0;
            var totalPages = 0;
            
            // EPUB 객체 생성 및 설정
            book = ePub("${filePathEncoded}");
            
            rendition = book.renderTo("viewer", {
              width: "100%",
              height: "100%",
              spread: "none",
              flow: "${epubViewerOptions.viewMode === 'scroll' ? 'scrolled' : 'paginated'}"
            });
            
            currentFlow = "${epubViewerOptions.viewMode === 'scroll' ? 'scrolled' : 'paginated'}";
            
            // 초기 위치 설정
            rendition.display();
            
            // 페이지 이동 함수
            function nextPage() {
              rendition.next();
            }
            
            function prevPage() {
              rendition.prev();
            }
            
            function goToPage(href) {
              rendition.display(href);
            }
            
            // 현재 페이지 정보 전달
            rendition.on("relocated", function(location) {
              // 페이지 번호 및 총 페이지 수 저장
              currentPage = location.start.displayed.page;
              totalPages = book.packaging.metadata.numberOfPages || location.total;
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pageChanged',
                currentPage: currentPage,
                totalPages: totalPages,
                href: location.start.href
              }));
            });
            
            // 제스처 설정 (왼쪽/오른쪽 탭)
            if ("${epubViewerOptions.viewMode}" !== "scroll") {
              document.getElementById("viewer").addEventListener('click', function(e) {
                var x = e.clientX;
                var width = document.body.clientWidth;
                
                if (x > width / 2) {
                  nextPage();
                } else {
                  prevPage();
                }
              });
            }
            
            // 준비 완료 이벤트
            book.ready.then(function() {
              document.getElementById("loading").style.display = "none";
              
              // 목차 정보 전달
              if ("${epubViewerOptions.enableTOC}" === "true") {
                book.loaded.navigation.then(function(toc) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'toc',
                    data: toc.toc
                  }));
                });
              }
              
              // 메타데이터 전달
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'metadata',
                data: book.packaging.metadata
              }));
              
              // 준비 완료 메시지 전달
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ready'
              }));
            });
            
            // RTL 설정 적용
            if ("${epubViewerOptions.enableRTL}" === "true") {
              rendition.spread("none");
              book.flow("paginated");
              book.direction = "rtl";
            }
            
            // 오류 처리
            book.on('openFailed', function(error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: error
              }));
            });
            
            // CSS 적용
            rendition.themes.default({
              body: {
                color: "${getTextColor()}",
                background: "${getBackgroundColor()}",
                'font-family': "'${epubViewerOptions.fontFamily}', sans-serif",
                'font-size': "${epubViewerOptions.fontSize}px",
                'line-height': "${epubViewerOptions.lineHeight}",
                padding: "${epubViewerOptions.marginVertical}px ${epubViewerOptions.marginHorizontal}px"
              },
              'a': {
                color: "${epubViewerOptions.linkColor}"
              }
            });
          </script>
        </body>
      </html>
    `;
  };

  // WebView에서 메시지 수신 처리
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'ready':
          setIsLoading(false);
          break;
        case 'pageChanged':
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
          break;
        case 'error':
          console.error('EPUB Error:', data.message);
          break;
        case 'toc':
          // 목차 데이터 처리
          console.log('TOC data received');
          break;
        case 'metadata':
          // 메타데이터 처리
          console.log('Metadata received');
          break;
      }
    } catch (e) {
      console.error('메시지 파싱 오류:', e);
    }
  };

  // 다음 페이지로 이동
  const goToNextPage = () => {
    webViewRef.current?.injectJavaScript('nextPage(); true;');
  };

  // 이전 페이지로 이동
  const goToPrevPage = () => {
    webViewRef.current?.injectJavaScript('prevPage(); true;');
  };

  // 특정 페이지로 이동
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    webViewRef.current?.injectJavaScript(`
      if (book && rendition) {
        let spineItems = book.spine.spineItems;
        if (${page} <= spineItems.length) {
          let targetCfi = spineItems[${page - 1}].href;
          goToPage(targetCfi);
        }
      }
      true;
    `);
  };

  // 테마 옵션 데이터
  const themes = [
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
    { value: 'sepia', label: '세피아' },
  ];

  // 폰트 옵션 데이터
  const fonts = [
    { value: 'System', label: '시스템' },
    { value: 'SpaceMono', label: '스페이스 모노' },
    { value: 'Arial', label: '아리알' },
    { value: 'Georgia', label: '조지아' },
  ];

  // 설정 섹션 데이터
  const sections: SettingsSection[] = [
    {
      title: '뷰어 모드',
      data: [
        {
          key: 'viewMode',
          type: 'button-group',
          value: epubViewerOptions.viewMode,
          options: [
            { value: 'page', label: '페이지', icon: 'file' },
            { value: 'scroll', label: '스크롤', icon: 'scroll' },
          ],
        },
      ],
    },
    {
      title: '테마',
      data: [
        {
          key: 'theme',
          type: 'button-group',
          value: epubViewerOptions.theme,
          options: themes.map((t) => ({ value: t.value, label: t.label })),
        },
      ],
    },
    {
      title: '글꼴',
      data: [
        {
          key: 'fontFamily',
          type: 'button-group',
          value: epubViewerOptions.fontFamily,
          options: fonts.map((f) => ({ value: f.value, label: f.label })),
        },
      ],
    },
    {
      title: '글자 크기',
      data: [
        {
          key: 'fontSize',
          type: 'slider',
          value: epubViewerOptions.fontSize,
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
          value: epubViewerOptions.lineHeight,
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
          value: epubViewerOptions.marginHorizontal,
          label: '여백',
          min: 8,
          max: 40,
          step: 2,
          unit: 'px',
        },
      ],
    },
    {
      title: '기능 설정',
      data: [
        {
          key: 'enableTOC',
          type: 'switch',
          value: epubViewerOptions.enableTOC,
          label: '목차 표시',
        },
        {
          key: 'enableTextSelection',
          type: 'switch',
          value: epubViewerOptions.enableTextSelection,
          label: '텍스트 선택 기능',
        },
      ],
    },
  ];

  // 설정 변경 핸들러
  const handleOptionChange = (key: string, value: any) => {
    updateEPUBViewerOptions({ [key]: value });
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setOverlayVisible((v) => !v)}>
        <View style={[styles.container]}>
          {isLoading && (
            <View style={[styles.loadingContainer]}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}

          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: getHtmlContent() }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccessFromFileURLs={true}
            onMessage={handleMessage}
            onError={(e) => console.error('WebView error:', e)}
          />

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

      {/* 설정 바텀 시트 */}
      <SettingsBottomSheet
        title="EPUB 설정"
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
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  webView: {
    flex: 1,
  },
});
