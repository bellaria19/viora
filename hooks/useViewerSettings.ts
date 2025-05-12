import { useContext } from 'react';
import { ViewerSettingsContext } from '@/contexts/ViewerSettingsContext';

export const useViewerSettings = () => {
  const context = useContext(ViewerSettingsContext);

  if (context === undefined) {
    throw new Error('useViewerSettings must be used within a ViewerSettingsProvider');
  }

  return context;
};
