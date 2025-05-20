import { colors } from '@/constants/colors';
import { FileInfo } from '@/types/files';
import { formatDate, formatFileSize, getFileIcon } from '@/utils/formatters';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FileItemProps {
  file: FileInfo;
  onPress: (file: FileInfo) => void;
  showSize?: boolean;
  onMorePress?: (file: FileInfo) => void;
}

export default memo(function FileItem({
  file,
  onPress,
  showSize = false,
  onMorePress,
}: FileItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.fileItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.tabIconDefault,
        },
      ]}
      onPress={() => onPress(file)}
      activeOpacity={0.85}
    >
      <FontAwesome6
        name={getFileIcon(file.type)}
        size={28}
        style={styles.fileIcon}
        color={colors.primary}
      />
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={[styles.fileDetail, { color: colors.secondaryText }]}>
          {showSize
            ? `${formatFileSize(file.size)} • ${formatDate(file.modifiedTime)}`
            : `최근 사용 날짜: ${formatDate(file.modifiedTime)}`}
        </Text>
      </View>
      {onMorePress && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onMorePress(file);
          }}
          style={styles.moreButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome6 name="ellipsis-vertical" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  fileIcon: {
    width: 32,
    height: 32,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  fileDetail: {
    fontSize: 13,
    fontWeight: '400',
  },
  moreButton: {
    marginLeft: 12,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
