import { Divider } from '@/components/common';
import { AboutModal } from '@/components/settings';
import { colors } from '@/constants/colors';
import { resetAllFiles } from '@/utils/fileManager';
import { FontAwesome6 } from '@expo/vector-icons';
import { Route, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, SectionList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

// 설정 항목 타입 정의
interface SettingItemType {
  id: string;
  title: string;
  icon: string;
  iconColor?: string;
  rightElement?: 'chevron' | 'switch';
  route?: string;
  dangerAction?: boolean;
  onPress?: () => void;
  switchValue?: boolean;
  onToggle?: (value: boolean) => void;
}

// 설정 섹션 타입 정의
interface SettingSectionType {
  title: string;
  data: SettingItemType[];
}

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  // 앱 초기화 핸들러
  const handleResetFiles = useCallback(() => {
    Alert.alert('파일 초기화', '모든 파일이 삭제됩니다. 계속하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetAllFiles();
            Alert.alert('완료', '모든 파일이 초기화되었습니다.');
          } catch (error) {
            Alert.alert('오류', '파일 초기화 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  }, []);

  // 각 항목 클릭 핸들러
  const handleItemPress = useCallback((item: SettingItemType) => {
    if (item.onPress) {
      item.onPress();
      return;
    }

    if (item.route) {
      router.push(item.route as Route);
    }
  }, []);

  // 설정 섹션 데이터
  const sections: SettingSectionType[] = [
    {
      title: '앱 설정',
      data: [
        {
          id: 'darkMode',
          title: '다크 모드',
          icon: 'moon',
          rightElement: 'switch',
          switchValue: isDarkMode,
          onToggle: setIsDarkMode,
        },
      ],
    },
    {
      title: '뷰어 설정',
      data: [
        {
          id: 'textSettings',
          title: '텍스트 뷰어 설정',
          icon: 'file-lines',
          rightElement: 'chevron',
          route: '/settings/text',
        },
        {
          id: 'imageSettings',
          title: '이미지 뷰어 설정',
          icon: 'image',
          rightElement: 'chevron',
          route: '/settings/image',
        },
        {
          id: 'pdfSettings',
          title: 'PDF 뷰어 설정',
          icon: 'file-pdf',
          rightElement: 'chevron',
          route: '/settings/pdf',
        },
        {
          id: 'epubSettings',
          title: 'EPUB 뷰어 설정',
          icon: 'book',
          rightElement: 'chevron',
          route: '/settings/epub',
        },
      ],
    },
    {
      title: '파일 관리',
      data: [
        {
          id: 'reset',
          title: '모든 파일 초기화',
          icon: 'trash',
          iconColor: colors.errorText,
          dangerAction: true,
          onPress: handleResetFiles,
        },
      ],
    },
    {
      title: '정보',
      data: [
        {
          id: 'about',
          title: '앱 정보',
          icon: 'circle-info',
          rightElement: 'chevron',
          onPress: () => setAboutVisible(true),
        },
        {
          id: 'feedback',
          title: '피드백 보내기',
          icon: 'envelope',
          rightElement: 'chevron',
          route: '/settings/feedback',
        },
      ],
    },
  ];

  // 설정 항목 렌더링 함수 (섹션 타이틀 제외)
  const renderSettingItem = useCallback(
    ({ item }: { item: SettingItemType }) => (
      <TouchableOpacity
        style={[styles.settingItem, item.dangerAction && styles.dangerItem]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
        disabled={item.rightElement === 'switch'}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.iconColor ? `${item.iconColor}15` : `${colors.primary}15` },
            ]}
          >
            <FontAwesome6 name={item.icon} size={16} color={item.iconColor || colors.primary} />
          </View>
          <Text style={[styles.settingItemTitle, item.dangerAction && { color: colors.errorText }]}>
            {item.title}
          </Text>
        </View>
        <View style={styles.settingItemRight}>
          {item.rightElement === 'chevron' && (
            <FontAwesome6 name="chevron-right" size={14} color={colors.secondaryText} />
          )}
          {item.rightElement === 'switch' && (
            <Switch
              value={item.switchValue || false}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          )}
        </View>
      </TouchableOpacity>
    ),
    [handleItemPress],
  );

  // 섹션 헤더 렌더링 함수
  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: { title: string } }) => (
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    ),
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSettingItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        stickySectionHeadersEnabled={false}
        // SectionSeparatorComponent={() => <Divider />}
      />
      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitleContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  dangerItem: {
    // borderBottomWidth: 0, // 구분선 FlatList에서 처리
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingItemTitle: {
    fontSize: 16,
    color: colors.text,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
