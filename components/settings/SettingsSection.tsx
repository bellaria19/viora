import Divider from '@/components/common/Divider';
import { colors } from '@/constants/colors';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export default memo(function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
      <Divider />
    </View>
  );
});

const styles = StyleSheet.create({
  settingsSection: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text,
  },
});
