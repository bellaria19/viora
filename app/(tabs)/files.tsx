import FloatingButton from '@/components/common/FloatingButton';
import DeleteFileModal from '@/components/files/DeleteFileModal';
import DuplicateFileModal from '@/components/files/DuplicateModal';
import EmptyFileList from '@/components/files/EmptyFileList';
import FileActionSheet from '@/components/files/FileActionSheet';
import FileItem from '@/components/files/FileItem';
import RenameFileModal from '@/components/files/RenameFileModal';
import SearchBar from '@/components/files/SearchBar';
import SortButton from '@/components/files/SortButton';
import SortMenu from '@/components/files/SortMenu';
import { colors } from '@/constants/colors';
import { useFilePicker } from '@/hooks/useFilePicker';
import { FileInfo } from '@/types/files';
import { SortOption } from '@/types/sort';
import { deleteFile, getDirectoryContents, renameFile } from '@/utils/fileManager';
import { sortFiles } from '@/utils/sorting';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FilesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DATE_DESC);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileInfo | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

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

  const loadFiles = async () => {
    const files = await getDirectoryContents();
    setFiles(files);
  };

  const filterAndSortFiles = useCallback(() => {
    let filtered = files.filter((file) =>
      file.name.normalize('NFC').toLowerCase().includes(searchQuery.toLowerCase()),
    );
    filtered = sortFiles(filtered, sortOption);
    setFilteredFiles(filtered);
  }, [files, searchQuery, sortOption]);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    filterAndSortFiles();
  }, [filterAndSortFiles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFiles();
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

  const handleDeleteCancel = () => {
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

  const handleRenameCancel = () => {
    setShowRenameModal(false);
    setFileToRename(null);
  };

  const handleMorePress = useCallback((file: FileInfo) => {
    setSelectedFile(file);
    setShowActionSheet(true);
  }, []);

  const handleActionSheetClose = () => {
    setShowActionSheet(false);
    setSelectedFile(null);
  };

  const handleActionSheetRename = () => {
    if (!selectedFile) return;
    setShowActionSheet(false);
    setFileToRename(selectedFile);
    setRenameInput(selectedFile.name);
    setShowRenameModal(true);
  };

  const handleActionSheetDelete = () => {
    if (!selectedFile) return;
    setShowActionSheet(false);
    setFileToDelete(selectedFile);
    setShowDeleteModal(true);
  };

  const renderHeader = () => (
    <View style={[styles.sectionCard, styles.searchRow]}>
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

        <View style={styles.listCard}>
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
                <EmptyFileList
                  iconName="magnifying-glass-minus"
                  message="검색 결과가 없습니다."
                  buttonLabel="파일 추가하기"
                  onPress={handleFilePick}
                />
              ) : (
                <EmptyFileList
                  iconName="folder-open"
                  message="파일을 추가해주세요."
                  buttonLabel="파일 추가하기"
                  onPress={handleFilePick}
                />
              )
            }
            ListHeaderComponent={renderHeader}
            stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </View>

        {files.length > 0 && (
          <FloatingButton
            onPress={handleFilePick}
            iconName="plus"
            backgroundColor={colors.primary}
          />
        )}

        <DuplicateFileModal
          visible={showDuplicateModal}
          currentFile={currentDuplicateFile}
          currentIndex={currentDuplicateIndex}
          totalCount={duplicateFiles.length}
          onSkip={handleDuplicateSkip}
          onOverwrite={handleDuplicateOverwrite}
        />

        <FileActionSheet
          visible={showActionSheet}
          fileName={selectedFile?.name}
          onRename={handleActionSheetRename}
          onDelete={handleActionSheetDelete}
          onClose={handleActionSheetClose}
        />

        <RenameFileModal
          visible={showRenameModal}
          value={renameInput}
          onChange={handleRenameInputChange}
          onCancel={handleRenameCancel}
          onConfirm={handleRenameConfirm}
        />

        <DeleteFileModal
          visible={showDeleteModal}
          fileName={fileToDelete?.name}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginHorizontal: 14,
    marginTop: 18,
    marginBottom: 12,
    padding: 12,
    shadowColor: colors.tabIconDefault,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 0,
    paddingTop: 2,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
