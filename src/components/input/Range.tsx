import { cn } from '@/utils/classnames';
import { v4 as uuidv4 } from 'uuid';

interface RangeProps extends React.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  min: number;
  max: number;
}

const RangeValue = ({ value }: { value: string }) => {
  return <span className="text-white font-bold text-2xl w-4">{value}</span>;
};

const Range = ({ disabled, min, max, ...props }: RangeProps) => {
  const switchId = `rangeinput-${uuidv4()}`;

  return (
    <label htmlFor={switchId} className="">
      <div className="flex flex-row gap-3 items-center flex-nowrap accent-red-500">
        <input
          {...props}
          disabled={disabled}
          type="range"
          id={switchId}
          min={min}
          max={max}
          className={cn(
            'w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700',
            disabled ? 'transparent bg-neutral-500' : ''
          )}
        />
        <RangeValue value={`${props.value}`} />
      </div>
    </label>
  );
};

export default Range;
