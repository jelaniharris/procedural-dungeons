import Image from 'next/image';

export const ShowDataCard = ({
  iconPath,
  name,
  description,
  placeholder = false,
  width = 100,
  height = 100,
}: {
  iconPath: string;
  name: string;
  description: string;
  placeholder?: boolean;
  width?: number;
  height?: number;
}) => {
  return (
    <div className="flex flex-row gap-3 bg-slate-500 rounded-sm p-3 text-white">
      <div className="basis-1/4">
        <Image
          src={
            placeholder ? `https://placehold.co/${width}x${height}` : iconPath
          }
          className="border border-slate-400"
          width={width}
          height={height}
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
