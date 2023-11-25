import { GameState, useStore } from '@/stores/useStore';
import { useEffect, useState } from 'react';
import Button from '../input/Button';
import Range from '../input/Range';
import Switch from '../input/Switch';
import { GameSettings } from '../types/GameTypes';
import CenterScreenContainer from './CenterScreen';

interface SettingsScreenProps {
  backToMenuCallback?: () => void;
  backToMenuText?: string;
}

export const SettingsScreen = ({
  backToMenuCallback,
  backToMenuText,
}: SettingsScreenProps) => {
  const getSettings = useStore((store: GameState) => store.getSettings);
  const saveSettings = useStore((store: GameState) => store.saveSettings);

  const [settings, setSettings] = useState<GameSettings>();
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  useEffect(() => {}, [settings]);

  const saveLocalSettings = () => {
    if (settings) {
      saveSettings(settings);
      setShowSaveMessage(true);
      setTimeout(() => {
        console.log('Hiding');
        setShowSaveMessage(false);
      }, 2000);
    }
  };

  const inputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    switch (e.target.name) {
      case 'sound':
        let newSound;
        if (settings.sound == false) {
          newSound = true;
        } else {
          newSound = false;
        }
        setSettings({ ...settings, sound: newSound });
        break;
      case 'music':
        let newMusic;
        if (settings.music == false) {
          newMusic = true;
        } else {
          newMusic = false;
        }
        setSettings({ ...settings, music: newMusic });
        break;
      case 'soundVolume':
        setSettings({ ...settings, soundVolume: parseInt(e.target.value, 0) });
        break;
      case 'musicVolume':
        setSettings({ ...settings, musicVolume: parseInt(e.target.value, 0) });
        break;
    }
  };

  if (!settings) {
    return <></>;
  }

  return (
    <CenterScreenContainer innerClassName="bg-slate-800 bg-opacity-90">
      <div className="flex flex-col gap-4 ">
        <span className="text-3xl uppercase text-white">Audio</span>
        <div className="flex flex-row gap-3 items-center">
          <span className="text-xl text-white font-bold">Sound</span>
          <Switch
            name="sound"
            checked={settings.sound}
            onChange={inputChanged}
          />
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-xl text-white font-bold">Sound Volume</span>
          <Range
            name="soundVolume"
            className="w-full"
            value={settings.soundVolume}
            min={0}
            max={100}
            onChange={inputChanged}
          />
        </div>
        <div className="flex flex-row gap-3 items-center">
          <span className="text-xl text-white font-bold">Music</span>
          <Switch
            name="music"
            checked={settings.music}
            onChange={inputChanged}
          />
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-xl text-white font-bold">Music Volume</span>
          <Range
            name="musicVolume"
            className="w-full"
            value={settings.musicVolume}
            min={0}
            max={100}
            onChange={inputChanged}
          />
        </div>
      </div>
      <div className="flex-auto"></div>
      {showSaveMessage && (
        <div className=" animate-slideInUp my-2">
          <div className="text-2xl text-white font-bold">Saved Settings</div>
        </div>
      )}
      <div className="pb-3 flex items-center gap-5">
        <Button onClick={saveLocalSettings} variant="primary">
          Save Settings
        </Button>
        <Button onClick={backToMenuCallback} variant="danger">
          {backToMenuText || `Back to Menu`}
        </Button>
      </div>
    </CenterScreenContainer>
  );
};
