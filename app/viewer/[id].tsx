import {
  EPUBViewer,
  ImageViewer,
  PDFViewer,
  TextViewer,
  ViewerUnsupported,
  ZipImageViewer,
} from '@/components/viewers';
import { FileInfo } from '@/types/files';
import { addRecentFile } from '@/utils/fileManager';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';

export default function ViewerScreen() {
  const params = useLocalSearchParams<{
    id: string;
    type: FileInfo['type'];
    uri: string;
    title: string;
  }>();

  const loadContent = useCallback(async () => {
    try {
      await addRecentFile({
        id: params.id,
        name: params.title,
        uri: params.uri,
        type: params.type,
        size: 0,
        modifiedTime: Date.now(),
      });
    } catch (err) {
      console.error('Error loading content:', err);
    }
  }, [params.id, params.title, params.uri, params.type]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const renderContent = () => {
    switch (params.type) {
      case 'text':
        return <TextViewer uri={params.uri} />;

      case 'image':
        return <ImageViewer uri={params.uri} />;

      case 'pdf':
        return <PDFViewer uri={params.uri} />;

      case 'epub':
        return <EPUBViewer uri={params.uri} />;

      case 'zip':
        return <ZipImageViewer uri={params.uri} />;

      default:
        return <ViewerUnsupported />;
    }
  };

  return <>{renderContent()}</>;
}
