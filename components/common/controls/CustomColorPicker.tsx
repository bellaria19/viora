import Divider from '@/components/common/Divider';
import { colors } from '@/constants/colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo, useCallback, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import ColorPicker, {
  ColorFormatsObject,
  colorKit,
  HueSlider,
  OpacitySlider,
  Panel1,
  Swatches,
} from 'reanimated-color-picker';

interface CustomColorPickerProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}
const customSwatches = new Array(6).fill('#fff').map(() => colorKit.randomRgbColor().hex());

export default memo(function CustomColorPicker({
  value,
  options,
  onChange,
}: CustomColorPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [resultColor, setResultColor] = useState(customSwatches[0]);
  const currentColor = useSharedValue(customSwatches[0]);
  const isCustom = value && !options.includes(value);

  const onColorChange = useCallback((color: ColorFormatsObject) => {
    'worklet';
    currentColor.value = color.hex;
  }, []);

  const onColorPick = useCallback(() => {
    setResultColor(currentColor.value);
  }, []);

  return (
    <View style={styles.colorPicker}>
      {options.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorOption,
            { backgroundColor: color },
            value === color && styles.colorOptionSelected,
          ]}
          onPress={() => onChange(color)}
        >
          {value === color && (
            <FontAwesome6
              name="check"
              size={12}
              color={['#fff'].includes(color) ? '#000' : '#fff'}
            />
          )}
        </TouchableOpacity>
      ))}

      {/* 커스텀 색상 선택 버튼 */}
      <TouchableOpacity
        style={[
          styles.colorOption,
          isCustom ? { backgroundColor: value } : styles.addButton,
          isCustom && styles.colorOptionSelected,
        ]}
        onPress={() => {
          setResultColor(value);
          setModalVisible(true);
        }}
      >
        {isCustom ? (
          <FontAwesome6 name="check" size={12} color="#fff" />
        ) : (
          <FontAwesome6 name="plus" size={16} color="#888" />
        )}
      </TouchableOpacity>

      {/* 커스텀 색상 선택 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerContainer}>
            <ColorPicker
              value={resultColor}
              sliderThickness={25}
              thumbSize={24}
              thumbShape="circle"
              onChange={onColorChange}
              onCompleteJS={onColorPick}
              style={styles.picker}
              boundedThumb
            >
              <Panel1 style={styles.panelStyle} />
              <HueSlider style={styles.sliderStyle} />
              <OpacitySlider style={styles.sliderStyle} />

              <Divider />
              <Swatches
                style={styles.swatchesContainer}
                swatchStyle={styles.swatchStyle}
                colors={customSwatches}
              />
              <Divider />
            </ColorPicker>
            {/* 확정 버튼 */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                onChange(resultColor);
                setModalVisible(false);
              }}
            >
              <FontAwesome6 name="check" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  addButton: {
    backgroundColor: '#f5f5f5',
    borderStyle: 'dashed',
    borderColor: '#bbb',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
  },
  closeButton: {
    marginTop: 8,
    alignSelf: 'center',
    padding: 8,
  },
  pickerContainer: {
    alignSelf: 'center',
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  panelStyle: {
    borderRadius: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  sliderStyle: {
    borderRadius: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  swatchesContainer: {
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 10,
  },
  swatchStyle: {
    borderRadius: 20,
    height: 30,
    width: 30,
    margin: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  picker: {
    gap: 20,
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
