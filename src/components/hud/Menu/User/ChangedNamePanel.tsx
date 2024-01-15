import Button from '@/components/input/Button';
import { FaArrowRight } from 'react-icons/fa';
import { PanelFrame } from '../../panel/PanelFrame';
import useMainMenuContext from '../../useMainMenuContext';

export const ChangedNamePanel = () => {
  const { playerData, pushToScreen, advanceNameChangeFormStep } =
    useMainMenuContext();

  return (
    <PanelFrame className="flex flex-col items-center justify-center gap-5">
      <h3 className="text-white font-bold text-2xl">
        User Name Change Successful
      </h3>
      <h4 className="text-white text-xl">
        Welcome,{' '}
        <span className="text-red-400 font-bold">{`${playerData?.name}#${playerData?.discriminator}`}</span>
      </h4>
      <Button
        type="submit"
        onClick={() => {
          advanceNameChangeFormStep(1);
          pushToScreen('play');
        }}
        leftIcon={<FaArrowRight />}
      >
        Play
      </Button>
    </PanelFrame>
  );
};
