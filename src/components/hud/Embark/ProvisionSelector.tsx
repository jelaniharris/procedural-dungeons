import { ProvisionData } from '@/components/types/GameData';
import {
  Provision,
  ProvisionRarity,
  ProvisionType,
} from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import { getProvisionDescription } from '@/utils/descriptionUtils';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import useEmbark from './EmbarkScreen';

// Individual chance percentages: Legendary 5%, Epic 20%, Rare 25%, Common 50%
const RARITY_WEIGHTS: { rarity: ProvisionRarity; chance: number }[] = [
  { rarity: ProvisionRarity.LEGENDARY, chance: 5 },
  { rarity: ProvisionRarity.EPIC, chance: 20 },
  { rarity: ProvisionRarity.RARE, chance: 25 },
  { rarity: ProvisionRarity.COMMON, chance: 50 },
];

const RARITY_STYLES: Record<
  ProvisionRarity,
  { card: string; label: string; labelText: string }
> = {
  [ProvisionRarity.COMMON]: {
    card: 'bg-slate-500 border-slate-600 hover:bg-slate-400',
    label: 'bg-slate-700',
    labelText: 'text-slate-200',
  },
  [ProvisionRarity.RARE]: {
    card: 'bg-blue-700 border-blue-900 hover:bg-blue-600',
    label: 'bg-blue-900',
    labelText: 'text-blue-200',
  },
  [ProvisionRarity.EPIC]: {
    card: 'bg-purple-700 border-purple-900 hover:bg-purple-600',
    label: 'bg-purple-900',
    labelText: 'text-purple-200',
  },
  [ProvisionRarity.LEGENDARY]: {
    card: 'bg-orange-600 border-orange-800 hover:bg-orange-500',
    label: 'bg-orange-800',
    labelText: 'text-orange-200',
  },
};

function rollRarity(rng: () => number): ProvisionRarity {
  const roll = rng() * 100;
  let cumulative = 0;
  for (const { rarity, chance } of RARITY_WEIGHTS) {
    cumulative += chance;
    if (roll < cumulative) return rarity;
  }
  return ProvisionRarity.COMMON;
}

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
      const shuffled = shuffleArray([...pData], randomGen);

      const withRarity: Provision[] = shuffled.map((prov) => {
        const rarity = rollRarity(randomGen);
        return {
          name: prov.name,
          description: prov.description,
          icon: prov.icon,
          provisionType: prov.provisionType,
          rarity,
          numberValue: prov.rarityValues[rarity],
        };
      });

      withRarity.push({
        name: 'No Provision',
        description: 'Nothing but your wits',
        numberValue: 0,
        provisionType: ProvisionType.NONE,
        rarity: ProvisionRarity.COMMON,
      });

      return withRarity.slice(0, amount + 1);
    },
    [generateGenerator, getLocalSettings, seed, shuffleArray]
  );

  useEffect(() => {
    if (provisions.length === 0) {
      const provisions = prepareProvisionList(3);
      setProvisions(provisions);
    }
  }, [prepareProvisionList, provisions]);

  console.log('[EmbarkScreen] Rendering embark screen');

  return (
    <section className="flex flex-col md:flex-row my-3 items-start gap-4">
      {provisions.map((prov) => {
        const provDescription = getProvisionDescription(prov);
        const rarityStyle = RARITY_STYLES[prov.rarity];
        const isSelected = prov.provisionType === selected?.provisionType;
        return (
          <div
            key={`prov-${prov.name}`}
            onClick={() => setSelected(prov)}
            className={cn(
              'border-4 p-2 md:p-5 w-full h-full md:w-1/4 rounded-lg',
              'flex flex-row md:flex-col gap-2 md:gap-4 cursor-pointer',
              rarityStyle.card,
              isSelected ? 'ring-4 ring-white' : ''
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
              {prov.provisionType !== ProvisionType.NONE && (
                <span
                  className={cn(
                    'text-xs font-bold uppercase rounded px-1 py-0.5 self-start md:self-center',
                    rarityStyle.label,
                    rarityStyle.labelText
                  )}
                >
                  {prov.rarity.charAt(0) + prov.rarity.slice(1).toLowerCase()}
                </span>
              )}
              <p
                className="text-white text-sm md:text-lg "
                dangerouslySetInnerHTML={{ __html: provDescription }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
};
