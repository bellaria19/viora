import EmptyState from '@/components/files/EmptyFileList';
import FileItem from '@/components/files/FileItem';
import { colors } from '@/constants/colors';
import { useFilePicker } from '@/hooks/useFilePicker';
import { FileInfo } from '@/types/files';
import { getRecentFiles } from '@/utils/fileManager';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecentScreen() {
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { handleFilePick } = useFilePicker({
    existingFiles: recentFiles,
    onFilesProcessed: () => router.push('/files'),
  });

  const loadRecentFiles = async () => {
    const files = await getRecentFiles();
    setRecentFiles(files);
  };

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentFiles();
    setRefreshing(false);
  };

  const handleFilePress = useCallback((file: FileInfo) => {
    router.push({
      pathname: '/viewer/[id]',
      params: {
        id: file.id,
        type: file.type,
        uri: file.uri,
        title: file.name,
      },
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={recentFiles}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => <FileItem file={item} onPress={handleFilePress} />}
          ListEmptyComponent={() => (
            <EmptyState
              iconName="clock-rotate-left"
              message="최근에 본 파일이 없습니다."
              buttonLabel="파일 추가하기"
              onPress={handleFilePick}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
