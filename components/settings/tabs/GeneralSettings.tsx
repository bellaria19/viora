import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import { colors } from '@/constants/colors';
import { resetAllFiles } from '@/utils/fileManager';
import { FontAwesome6 } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface GeneralSettingsProps {
  onShowAbout: () => void;
}

export default function GeneralSettings({ onShowAbout }: GeneralSettingsProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 앱 초기화 함수
  const handleResetFiles = () => {
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
  };

  return (
    <View style={styles.container}>
      <SettingsSection title="앱 설정">
        <SettingItem label="다크 모드">
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </SettingItem>
      </SettingsSection>

      <SettingsSection title="파일 관리">
        <View style={styles.generalButtons}>
          <TouchableOpacity
            style={styles.generalButton}
            onPress={handleResetFiles}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="trash" size={18} color={colors.errorText} />
            <Text style={[styles.generalButtonText, { color: colors.errorText }]}>
              모든 파일 초기화
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.generalButton} activeOpacity={0.7}>
            <FontAwesome6 name="download" size={18} color={colors.primary} />
            <Text style={styles.generalButtonText}>파일 백업</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.generalButton} activeOpacity={0.7}>
            <FontAwesome6 name="upload" size={18} color={colors.primary} />
            <Text style={styles.generalButtonText}>백업 복원</Text>
          </TouchableOpacity>
        </View>
      </SettingsSection>

      <SettingsSection title="정보">
        <TouchableOpacity style={styles.infoRow} onPress={onShowAbout} activeOpacity={0.7}>
          <View style={styles.infoContent}>
            <FontAwesome6 name="circle-info" size={18} color={colors.primary} />
            <Text style={styles.infoLabel}>앱 정보</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
          <View style={styles.infoContent}>
            <FontAwesome6 name="envelope" size={18} color={colors.primary} />
            <Text style={styles.infoLabel}>피드백 보내기</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color={colors.secondaryText} />
        </TouchableOpacity>
      </SettingsSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  generalButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  generalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.buttonBackground,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  generalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.text,
  },
});
