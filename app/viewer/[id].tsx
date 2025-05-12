import EPUBViewer from '@/components/viewers/EPUBViewer';
import ImageViewer from '@/components/viewers/ImageViewer';
import PDFViewer from '@/components/viewers/PDFViewer';
import TextViewer from '@/components/viewers/TextViewer';
import ViewerError from '@/components/viewers/ViewerError';
import ViewerLoading from '@/components/viewers/ViewerLoading';
import ViewerUnsupported from '@/components/viewers/ViewerUnsupported';
import ZipImageViewer from '@/components/viewers/ZipImageViewer';
import { FileInfo } from '@/types/files';
import { addRecentFile } from '@/utils/fileManager';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export default function ViewerScreen() {
  const params = useLocalSearchParams<{
    id: string;
    type: FileInfo['type'];
    uri: string;
    title: string;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await addRecentFile({
        id: params.id,
        name: params.title,
        uri: params.uri,
        type: params.type,
        size: 0,
        modifiedTime: Date.now(),
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('파일을 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  }, [params.id, params.title, params.uri, params.type]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const renderContent = () => {
    if (isLoading) {
      return <ViewerLoading />;
    }

    if (error) {
      return <ViewerError message={error} />;
    }

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
