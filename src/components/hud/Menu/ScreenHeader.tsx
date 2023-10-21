import { displayPlayerName } from '@/utils/playerUtils';
import Image from 'next/image';
import useMainMenuContext from '../useMainMenuContext';

const ScreenHeader = () => {
  const { playerData } = useMainMenuContext();

  return (
    <div className="relative flex flex-col items-center">
      <Image
        src="/textures/Tower Of Greed Logo.png"
        width={500}
        height={500}
        priority
        alt="Tower of Greed Logo"
      />
      <span className=" text-sm text-gray-500">
        {playerData ? displayPlayerName(playerData) : 'Anonmyous'}
      </span>
    </div>
  );
};

export default ScreenHeader;
