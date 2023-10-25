import Button from '@/components/input/Button';
import useMainMenuContext from '../useMainMenuContext';
import ScreenHeader from './ScreenHeader';

const MainScreen = () => {
  const { pushToScreen } = useMainMenuContext();

  return (
    <>
      <ScreenHeader />
      <div className="flex-auto"></div>
      <Button onClick={() => pushToScreen('play')}>Play Game</Button>
      <Button disabled>Tutorial</Button>
      <Button onClick={() => pushToScreen('scores')}>Scores</Button>
      <Button disabled>Settings</Button>
      <div className="flex-auto"></div>
    </>
  );
};

export default MainScreen;
