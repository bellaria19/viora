import { FileInfo } from '@/types/files';
import { SortOption } from '@/types/sort';

export const sortFiles = (files: FileInfo[], sortOption: SortOption): FileInfo[] => {
  return [...files].sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'size_asc':
        return a.size - b.size;
      case 'size_desc':
        return b.size - a.size;
      case 'date_asc':
        return a.modifiedTime - b.modifiedTime;
      case 'date_desc':
        return b.modifiedTime - a.modifiedTime;
      default:
        return 0;
    }
  });
};
