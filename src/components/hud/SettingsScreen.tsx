import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaDoorOpen, FaSave } from 'react-icons/fa';
import { ContainerHeader } from '../core/ContainerHeader';
import Button from '../input/Button';
import Range from '../input/Range';
import Switch from '../input/Switch';
import { PLAYER_DIED } from '../types/EventTypes';
import { GameSettings, TouchControls } from '../types/GameTypes';
import useGame from '../useGame';
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
  const adjustHealth = useStore((state: GameState) => state.adjustHealth);
  const [showConfirmExitGame, setShowConfirmExitGame] = useState(false);

  const [settings, setSettings] = useState<GameSettings>();
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const { publish, currentHud } = useGame();

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

  const touchChanged = (type: TouchControls) => {
    if (!settings) return;
    setSettings({ ...settings, touchControlType: type });
  };

  const toggleExitGame = (val: boolean) => {
    setShowConfirmExitGame(val);
  };

  const exitGame = () => {
    setShowConfirmExitGame(false);
    if (backToMenuCallback) {
      backToMenuCallback();
    }
    adjustHealth(-100);
    publish(PLAYER_DIED, {});
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

  if (showConfirmExitGame) {
    return (
      <CenterScreenContainer innerClassName="bg-slate-800 bg-opacity-90">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-white font-bold text-xl">
            Are you sure you want to leave this climb?
          </h3>
          <h4 className="text-white text-xl">(Your score will not saved)</h4>

          <div className="pb-3 flex items-center gap-5">
            <Button onClick={() => toggleExitGame(false)} variant="primary">
              No, Stay
            </Button>
            <Button onClick={exitGame} variant="danger">
              Yes, Leave Game
            </Button>
          </div>
        </div>
      </CenterScreenContainer>
    );
  }

  return (
    <CenterScreenContainer innerClassName="bg-slate-700 bg-opacity-90">
      <div className="flex flex-col gap-4">
        <h1 className="text-white text-2xl font-bold text-center">Tutorial</h1>
        <ContainerHeader title="Audio" />

        <div className="flex flex-row gap-3 items-center">
          <span className="text-base text-white font-bold">Sound On</span>
          <Switch
            name="sound"
            checked={settings.sound}
            onChange={inputChanged}
          />
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-base text-white font-bold">Sound Volume</span>
          <Range
            name="soundVolume"
            className="w-full"
            value={settings.soundVolume}
            disabled={!settings.sound}
            min={0}
            max={100}
            onChange={inputChanged}
          />
        </div>
        <div className="flex flex-row gap-3 items-center">
          <span className="text-base text-white font-bold">Music On</span>
          <Switch
            name="music"
            checked={settings.music}
            onChange={inputChanged}
          />
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-base text-white font-bold">Music Volume</span>
          <Range
            name="musicVolume"
            className="w-full"
            value={settings.musicVolume}
            disabled={!settings.music}
            min={0}
            max={100}
            onChange={inputChanged}
          />
        </div>
        <div className="flex flex-col gap-2 ">
          <ContainerHeader title="Screen Controls" />
          <div className="flex flex-row gap-4">
            <Button
              name="touchControlsNone"
              className={cn(
                'w-1/3',
                settings.touchControlType === TouchControls.CONTROL_NONE
                  ? 'bg-blue-500'
                  : 'bg-slate-600'
              )}
              onClick={() => touchChanged(TouchControls.CONTROL_NONE)}
            >
              <span className="text-white text-lg">No Controls</span>
            </Button>
            <Button
              name="touchControlsThimble"
              className={cn(
                'w-1/3',
                settings.touchControlType === TouchControls.CONTROL_THIMBLE
                  ? 'bg-blue-500'
                  : 'bg-slate-600'
              )}
              onClick={() => touchChanged(TouchControls.CONTROL_THIMBLE)}
            >
              <span className="text-white text-lg">Thimble</span>
            </Button>
            <Button
              name="touchControlsDPad"
              className={cn(
                'w-1/3',
                settings.touchControlType === TouchControls.CONTROL_DPAD
                  ? 'bg-blue-500'
                  : 'bg-slate-600'
              )}
              onClick={() => touchChanged(TouchControls.CONTROL_DPAD)}
            >
              <span className="text-white text-lg">Directional Pad</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-auto"></div>
      {showSaveMessage && (
        <div className=" animate-slideInUp my-2">
          <div className="text-2xl text-white font-bold">Saved Settings</div>
        </div>
      )}
      <div className="pb-2 flex items-center gap-5">
        <Button
          onClick={saveLocalSettings}
          variant="primary"
          leftIcon={<FaSave />}
        >
          Save Settings
        </Button>
        <Button
          onClick={backToMenuCallback}
          variant="danger"
          leftIcon={<FaArrowLeft />}
        >
          {backToMenuText || `Back to Menu`}
        </Button>
      </div>
      {currentHud !== 'mainmenu' && (
        <div className="pb-3 flex justify-center items-center w-full">
          <Button
            onClick={() => toggleExitGame(true)}
            variant="danger"
            className="w-1/3 py-1 bg-yellow-700 hover:bg-yellow-600"
            leftIcon={<FaDoorOpen />}
          >
            Abandon Climb
          </Button>
        </div>
      )}
    </CenterScreenContainer>
  );
};
