import { useContext } from 'react';
import { MainMenuContext, MainMenuContextValue } from './MainMenu';

export default function useMainMenuContext() {
  return useContext(MainMenuContext) as MainMenuContextValue;
}
