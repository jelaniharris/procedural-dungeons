import Image from 'next/image';
import { ReactNode } from 'react';

export const ShowDataCard = ({
  iconPath,
  name,
  description,
  placeholder = false,
  width = 100,
  height = 100,
  damage,
  children,
}: {
  iconPath: string;
  name: string;
  description: string;
  placeholder?: boolean;
  width?: number;
  height?: number;
  damage?: number;
  children?: ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-3 bg-slate-500 rounded-sm p-2 text-white">
      <div className="flex flex-row gap-3 bg-slate-500 rounded-sm p-1 text-white">
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
          <div className="flex flex-row items-center gap-2">
            <strong>{name}</strong>
            {damage !== undefined && (
              <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                -{damage} ❤️
              </span>
            )}
          </div>
          <span dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
      {children && (
        <div className="flex flex-row items-end gap-1">{children}</div>
      )}
    </div>
  );
};
