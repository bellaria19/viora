import { FloatingButton } from '@/components/common';
import {
  DeleteFileModal,
  DuplicateModal,
  EmptyState,
  FileItem,
  FileOptionsModal,
  RenameFileModal,
  SearchBar,
  SortButton,
  SortMenu,
} from '@/components/files';
import { colors } from '@/constants/colors';
import { useFilePicker } from '@/hooks/useFilePicker';
import { FileInfo } from '@/types/files';
import { SortOption } from '@/types/sort';
import { deleteFile, getDirectoryContents, getFileType, renameFile } from '@/utils/fileManager';
import { sortFiles } from '@/utils/sorting';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FilesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DATE_DESC);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);

  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileInfo | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [showOptionModal, setShowOptionModal] = useState(false);

  const {
    showDuplicateModal,
    currentDuplicateFile,
    currentDuplicateIndex,
    duplicateFiles,
    handleFilePick,
    handleDuplicateSkip,
    handleDuplicateOverwrite,
  } = useFilePicker({
    existingFiles: files,
    onFilesProcessed: () => router.push('/files'),
  });

  const loadFiles = useCallback(async () => {
    const files = await getDirectoryContents();
    setFiles(files);
  }, [setFiles]);

  const filterAndSortFiles = useCallback(() => {
    let filtered = files.filter((file) =>
      file.name.normalize('NFC').toLowerCase().includes(searchQuery.toLowerCase()),
    );
    filtered = sortFiles(filtered, sortOption);
    setFilteredFiles(filtered);
  }, [files, searchQuery, sortOption]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [loadFiles]),
  );

  useEffect(() => {
    filterAndSortFiles();
  }, [filterAndSortFiles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  }, [loadFiles]);

  const handleFilePress = useCallback((file: FileInfo) => {
    const extType = getFileType(file.name);
    const type = file.type || extType;
    router.push({
      pathname: '/viewer/[id]',
      params: {
        id: file.id,
        type,
        uri: file.uri,
        title: file.name,
      },
    });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    try {
      await deleteFile(fileToDelete.uri);
      setFileToDelete(null);
      setShowDeleteModal(false);
      await loadFiles();
    } catch (e) {
      Alert.alert('삭제 실패', '파일 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteClose = () => {
    setFileToDelete(null);
    setShowDeleteModal(false);
  };

  const handleRenameInputChange = (text: string) => {
    setRenameInput(text);
  };

  const handleRenameConfirm = async () => {
    if (!fileToRename) return;
    const trimmed = renameInput.trim();
    if (!trimmed || trimmed === fileToRename.name) {
      setShowRenameModal(false);
      setFileToRename(null);
      return;
    }
    try {
      await renameFile(fileToRename.uri, trimmed);
      setShowRenameModal(false);
      setFileToRename(null);
      await loadFiles();
    } catch (e) {
      Alert.alert('이름 변경 실패', '파일 이름 변경 중 오류가 발생했습니다.');
    }
  };

  const handleRenameClose = () => {
    setShowRenameModal(false);
    setFileToRename(null);
  };

  const handleMorePress = useCallback((file: FileInfo) => {
    setSelectedFile(file);
    setShowOptionModal(true);
  }, []);

  const handleOptionModalClose = () => {
    setShowOptionModal(false);
    setSelectedFile(null);
  };

  const handleOptionModalRename = () => {
    if (!selectedFile) return;
    setShowOptionModal(false);
    setFileToRename(selectedFile);
    setRenameInput(selectedFile.name);
    setShowRenameModal(true);
  };

  const handleOptionModalDelete = () => {
    if (!selectedFile) return;
    setShowOptionModal(false);
    setFileToDelete(selectedFile);
    setShowDeleteModal(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="파일 검색..." />
      </View>
      <SortButton currentSortOption={sortOption} onPress={() => setShowSortMenu(true)} iconOnly />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SortMenu
          visible={showSortMenu}
          onClose={() => setShowSortMenu(false)}
          currentSortOption={sortOption}
          onSelect={setSortOption}
        />

        {renderHeader()}

        <FlatList
          data={filteredFiles}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <FileItem
              file={item}
              onPress={handleFilePress}
              showSize
              onMorePress={handleMorePress}
            />
          )}
          ListEmptyComponent={() =>
            searchQuery ? (
              <EmptyState
                iconName="magnifying-glass-minus"
                message="검색 결과가 없습니다."
                buttonLabel="파일 추가하기"
                onPress={handleFilePick}
              />
            ) : (
              <EmptyState
                iconName="folder-open"
                message="파일을 추가해주세요."
                buttonLabel="파일 추가하기"
                onPress={handleFilePick}
              />
            )
          }
          // ListHeaderComponent={renderHeader}
          // stickyHeaderIndices={[0]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        {files.length > 0 && (
          <FloatingButton
            onPress={handleFilePick}
            iconName="plus"
            backgroundColor={colors.primary}
          />
        )}

        <DuplicateModal
          visible={showDuplicateModal}
          currentFile={currentDuplicateFile}
          currentIndex={currentDuplicateIndex}
          totalCount={duplicateFiles.length}
          onSkip={handleDuplicateSkip}
          onOverwrite={handleDuplicateOverwrite}
          onClose={() => ({})}
        />

        <FileOptionsModal
          visible={showOptionModal}
          fileName={selectedFile?.name}
          onRename={handleOptionModalRename}
          onDelete={handleOptionModalDelete}
          onClose={handleOptionModalClose}
        />

        <RenameFileModal
          visible={showRenameModal}
          value={renameInput}
          onChange={handleRenameInputChange}
          onClose={handleRenameClose}
          onConfirm={handleRenameConfirm}
        />

        <DeleteFileModal
          visible={showDeleteModal}
          fileName={fileToDelete?.name}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
