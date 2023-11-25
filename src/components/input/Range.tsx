import { v4 as uuidv4 } from 'uuid';

interface RangeProps extends React.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  min: number;
  max: number;
}

const Range = ({ disabled, min, max, ...props }: RangeProps) => {
  const switchId = `rangeinput-${uuidv4()}`;

  return (
    <label
      htmlFor={switchId}
      className="bg-gray-100 relative cursor-pointer w-20 h-10 rounded-full"
    >
      <input
        {...props}
        disabled={disabled}
        type="range"
        id={switchId}
        min={min}
        max={max}
        className=""
      />
    </label>
  );
};

export default Range;
