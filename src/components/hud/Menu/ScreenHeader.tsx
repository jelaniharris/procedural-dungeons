import { cn } from '@/utils/classnames';
import { displayPlayerName } from '@/utils/playerUtils';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';
import useMainMenuContext from '../useMainMenuContext';

interface ScreenHeaderProps {
  hideName?: boolean;
}

const ScreenHeader = ({ hideName = false }: ScreenHeaderProps) => {
  const { playerData } = useMainMenuContext();

  return (
    <div className="relative flex flex-col items-center">
      <Image
        src="/textures/Tower Of Greed Logo.png"
        width={400}
        height={400}
        priority
        alt="Tower of Greed Logo"
      />
      <span
        className={cn(
          'flex flex-row gap-2 rounded-md p-2 items-center',
          'bg-slate-700 text-sm text-gray-500',
          hideName ? 'hidden' : ''
        )}
      >
        <FaUser />
        {playerData ? displayPlayerName(playerData) : 'Anonmyous'}
      </span>
    </div>
  );
};

export default ScreenHeader;
