import Image from 'next/image';

export const ShowDataCard = ({
  iconPath,
  name,
  description,
}: {
  iconPath: string;
  name: string;
  description: string;
}) => {
  return (
    <div className="flex flex-row gap-3 bg-slate-500 rounded-sm p-3 text-white">
      <div className="basis-1/4">
        <Image
          src={iconPath}
          className="border border-slate-400"
          width={100}
          height={100}
          alt={name}
        />
      </div>
      <div className="flex flex-col gap-1 basis-3/4">
        <strong>{name}</strong>
        {description}
      </div>
    </div>
  );
};
