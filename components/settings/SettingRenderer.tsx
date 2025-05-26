import { ButtonGroup, ColorPicker, StepperControl } from '@/components/common/controls';
import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import { SettingSectionData } from '@/types/settings';
import { Switch } from 'react-native';

interface SettingRendererProps {
  sections: SettingSectionData[];
  onChange: (key: string, value: any) => void;
}

export default function SettingRenderer({ sections, onChange }: SettingRendererProps) {
  return (
    <>
      {sections.map((section) => (
        <SettingsSection key={section.title} title={section.title}>
          {section.data.map((item) => (
            <SettingItem
              key={item.key}
              label={item.label}
              description={'description' in item ? item.description : undefined}
            >
              {item.type === 'button-group' && (
                <ButtonGroup
                  value={item.value}
                  options={item.options}
                  onChange={(v: any) => onChange(item.key, v)}
                />
              )}
              {item.type === 'switch' && (
                <Switch value={item.value} onValueChange={(v: boolean) => onChange(item.key, v)} />
              )}
              {item.type === 'color-group' && (
                <ColorPicker
                  value={item.value}
                  options={item.options}
                  onChange={(v: string) => onChange(item.key, v)}
                />
              )}
              {item.type === 'stepper' && (
                <StepperControl
                  value={item.value}
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  unit={item.unit}
                  formatValue={item.formatValue}
                  onChange={(v: number) => onChange(item.key, v)}
                />
              )}
            </SettingItem>
          ))}
        </SettingsSection>
      ))}
    </>
  );
}
