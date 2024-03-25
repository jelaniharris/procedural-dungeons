import { ItemData } from '@/components/types/GameData';
import { ShowDataCard } from './ShowDataCard';
import { TutorialHeader } from './TutorialHeader';

export const ShowIconData = ({
  title,
  grouping,
}: {
  title: string;
  grouping: string;
}) => {
  const iconData = ItemData.filter((item) => item.grouping === grouping);

  return (
    <>
      <TutorialHeader title={title} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {iconData.map((data) => {
          let description = data.description;
          description = description.replaceAll(
            '%SCORE%',
            `${data.scoreValue ?? 0}`
          );
          description = description.replaceAll(
            '%AMOUNT%',
            `${data.numberValue ?? 0}`
          );
          description = description.replaceAll(
            '%STATUSAMOUNT%',
            `${data.statusTurnsValue ?? 0}`
          );

          return (
            <ShowDataCard
              key={`itemdata-${data.name}`}
              iconPath={`/images/icons/${data.icon}`}
              name={data.name}
              description={description}
            />
          );
        })}
      </div>
    </>
  );
};
