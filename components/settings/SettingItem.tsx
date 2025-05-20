import { colors } from '@/constants/colors';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SettingItemProps {
  label: string;
  children: React.ReactNode;
  description?: string;
}

export default memo(function SettingItem({ label, children, description }: SettingItemProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingItemHeader}>
        <Text style={styles.settingItemLabel}>{label}</Text>
        <View style={styles.settingItemControl}>{children}</View>
      </View>
      {description && <Text style={styles.settingItemDescription}>{description}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  settingItem: {
    marginBottom: 16,
  },
  settingItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingItemLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  settingItemDescription: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: -4,
    marginBottom: 8,
  },
  settingItemControl: {
    flexShrink: 0,
  },
});
