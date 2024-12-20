import { ProvisionData } from '@/components/types/GameData';
import { Provision, ProvisionType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import { getProvisionDescription } from '@/utils/descriptionUtils';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import useEmbark from './EmbarkScreen';

export const ProvisionSelector = () => {
  const getLocalSettings = useStore(
    (store: GameState) => store.getLocalSettings
  );
  const seed = useStore((store: GameState) => store.seed);
  const generateGenerator = useStore(
    (store: GameState) => store.generateGenerator
  );
  const shuffleArray = useStore((store: GameState) => store.shuffleArray);
  const [provisions, setProvisions] = useState<Provision[]>([]);

  const { selected, setSelected } = useEmbark();

  const prepareProvisionList = useCallback(
    (amount: number) => {
      const pData = ProvisionData.filter(
        () => true //baseProvisions[data.provisionType] === true
      );
      const randomGen = generateGenerator(seed);
      let pList = shuffleArray([...pData], randomGen);
      pList.push({
        name: 'No Provision',
        description: 'Nothing but your wits',
        numberValue: 0,
        provisionType: ProvisionType.NONE,
      });
      pList = pList.slice(0, amount + 1);
      return pList;
    },
    [generateGenerator, getLocalSettings, seed, shuffleArray]
  );

  useEffect(() => {
    if (provisions.length === 0) {
      const provisions = prepareProvisionList(3);
      setProvisions(provisions);
    }
  }, [prepareProvisionList, provisions]);

  const setProvSelected = (provType: ProvisionType) => {
    setSelected(provType);
  };

  console.log('[EmbarkScreen] Rendering embark screen');

  return (
    <section className="flex flex-col md:flex-row my-3 items-start gap-4">
      {provisions.map((prov) => {
        const provDescription = getProvisionDescription(prov);
        return (
          <div
            key={`prov-${prov.name}`}
            onClick={() => setProvSelected(prov.provisionType)}
            className={cn(
              'bg-slate-600 hover:bg-slate-500 border-slate-700 border-4 p-2 md:p-5 w-full h-full md:w-1/4 rounded-lg',
              'flex flex-row md:flex-col gap-2 md:gap-4 cursor-pointer',
              prov.provisionType === selected
                ? 'bg-blue-600 hover:bg-blue-500 border-blue-800'
                : ''
            )}
          >
            <Image
              src="https://placehold.co/256x256"
              width={256}
              height={256}
              className="w-24 md:w-auto"
              alt="provision"
            />
            <div className="flex flex-col flex-grow gap-1 md:gap-2">
              <span className="text-white md:text-center text-xl font-bold bg-slate-800 bg-opacity-50 rounded-md p-1">
                {prov.name}
              </span>
              <p className="text-white text-sm md:text-lg ">
                {provDescription}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
};
