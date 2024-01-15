import Button from '@/components/input/Button';
import { FaArrowLeft } from 'react-icons/fa';
import useMainMenuContext from '../../useMainMenuContext';
import ScreenHeader from '../ScreenHeader';
import { ChangedNamePanel } from './ChangedNamePanel';
import { NameChangeForm } from './NameChangeForm';

const NameChangeScreen = () => {
  const { popScreen, nameChangeStep, advanceNameChangeFormStep } =
    useMainMenuContext();

  return (
    <div className="flex flex-col justify-center">
      <ScreenHeader hideName />
      <div className="flex-auto"></div>
      {nameChangeStep === 1 ? <NameChangeForm /> : <ChangedNamePanel />}
      <div className="flex-auto"></div>
      <Button
        variant="danger"
        leftIcon={<FaArrowLeft />}
        type="submit"
        onClick={() => {
          advanceNameChangeFormStep(1);
          popScreen();
        }}
      >
        Back
      </Button>
    </div>
  );
};

export default NameChangeScreen;
