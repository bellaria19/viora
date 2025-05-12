// import { SettingsSection } from '@/components/common/SettingsBottomSheet';
// import { useViewerSettings } from '@/hooks/useViewerSettings';
// import ImageViewer from './ImageViewer';

// type SingleImageViewerProps = {
//   uri: string;
// };

// export default function SingleImageViewer({ uri }: SingleImageViewerProps) {
//   const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

//   // 설정 섹션 정의 (리터럴 타입 명시)
//   const colorOptions = ['#ffffff', '#000000', '#222222', '#444444', '#666666', '#888888'];
//   const contentFitOptions = [
//     { value: 'contain', label: 'Contain' },
//     { value: 'cover', label: 'Cover' },
//     { value: 'fill', label: 'Fill' },
//     { value: 'none', label: 'None' },
//   ];
//   const sections: SettingsSection[] = [
//     {
//       title: '제스처 설정',
//       data: [
//         {
//           key: 'enableDoubleTapZoom',
//           type: 'switch',
//           value: imageViewerOptions.enableDoubleTapZoom,
//           label: '더블 탭 확대/축소',
//         },
//       ],
//     },
//     {
//       title: '성능 설정',
//       data: [
//         {
//           key: 'enablePreload',
//           type: 'switch',
//           value: imageViewerOptions.enablePreload,
//           label: '이미지 미리 로드',
//         },
//         {
//           key: 'enableCache',
//           type: 'switch',
//           value: imageViewerOptions.enableCache,
//           label: '이미지 캐싱',
//         },
//       ],
//     },
//     {
//       title: '표시 설정',
//       data: [
//         {
//           key: 'contentFit',
//           type: 'button-group',
//           value: imageViewerOptions.contentFit,
//           label: '이미지 표시 방식',
//           options: contentFitOptions,
//         },
//       ],
//     },
//     {
//       title: '색상 설정',
//       data: [
//         {
//           key: 'backgroundColor',
//           type: 'color-group',
//           value: imageViewerOptions.backgroundColor,
//           label: '배경 색상',
//           colorOptions,
//         },
//       ],
//     },
//   ];

//   return (
//     <ImageViewer
//       uris={[uri]}
//       settingsSections={sections}
//       onOptionChange={(key, value) => updateImageViewerOptions({ [key]: value })}
//       settingsTitle="이미지 설정"
//       imageViewerOptions={imageViewerOptions}
//     />
//   );
// }
