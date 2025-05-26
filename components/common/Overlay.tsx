import { FontAwesome6 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OverlayProps {
  visible: boolean;
  onBack?: () => void;
  onSettings?: () => void;
  onRotation?: () => void;
  showSlider?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showRotation?: boolean;
}

const BAR_HEIGHT = 70; // topBar의 height와 동일하게 맞춰줍니다.
const BOTTOM_BAR_HEIGHT = BAR_HEIGHT * 1.5;

export default function Overlay({
  visible,
  onBack,
  onSettings,
  onRotation,
  showSlider = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showRotation = false,
}: OverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <FontAwesome6 name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topRightButtons}>
          {showRotation && (
            <TouchableOpacity onPress={onRotation} style={styles.iconButton}>
              <FontAwesome6 name="rotate-right" size={26} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onSettings} style={styles.iconButton}>
            <FontAwesome6 name="gear" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.bottomBar, { height: showSlider ? BOTTOM_BAR_HEIGHT : BAR_HEIGHT }]}>
        {showSlider && (
          <>
            <View style={styles.pageNavRow}>
              <TouchableOpacity
                onPress={() => onPageChange && onPageChange(Math.max(1, (currentPage || 1) - 1))}
                style={styles.pageButton}
              >
                <FontAwesome6 name="chevron-left" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.pageText}>
                {currentPage} / {totalPages}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  onPageChange && onPageChange(Math.min(totalPages || 1, (currentPage || 1) + 1))
                }
                style={styles.pageButton}
              >
                <FontAwesome6 name="chevron-right" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={totalPages}
              value={currentPage}
              step={1}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#888"
              thumbTintColor="#fff"
              onSlidingComplete={(value) => onPageChange && onPageChange(value)}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: BAR_HEIGHT,
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  bottomBar: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNavRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  pageText: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 12,
  },
  slider: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 4,
  },
});
