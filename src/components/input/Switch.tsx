import { v4 as uuidv4 } from 'uuid';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
}

const Switch = ({ disabled, ...props }: SwitchProps) => {
  const switchId = `switchinput-${uuidv4()}`;

  return (
    <label
      htmlFor={switchId}
      className="bg-gray-100 relative cursor-pointer w-20 h-10 rounded-full"
    >
      <input
        {...props}
        disabled={disabled}
        type="checkbox"
        id={switchId}
        className="sr-only peer"
      />
      <span className="w-2/5 h-4/5 bg-rose-300 absolute rounded-full left-1 top-1 peer-checked:bg-rose-600 peer-checked:left-11 transition-all duration-500"></span>
    </label>
  );
};

export default Switch;
