import Button from '@/components/input/Button';
import { useAddUser } from '@/hooks/useAddUser';
import { cn } from '@/utils/classnames';
import { getPlayerLocalData, savePlayerLocalData } from '@/utils/playerUtils';
import wait from '@/utils/wait';
import ReactFlagsSelect from 'react-flags-select';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FaEdit } from 'react-icons/fa';
import { LoadingSpinner } from '../../LoadingSpinner';
import { PanelFrame } from '../../panel/PanelFrame';
import useMainMenuContext from '../../useMainMenuContext';

interface IFormInputs {
  name: string;
  country: string;
  discriminator: number;
}

export const NameChangeForm = () => {
  const { playerData, setPlayerData, advanceNameChangeFormStep } =
    useMainMenuContext();
  const { isLoading, addUser } = useAddUser();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: playerData ? playerData.name : '',
      discriminator: playerData
        ? playerData.discriminator
        : Math.floor(Math.random() * 999),
      country: playerData ? playerData.country : '',
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const savedData = await addUser({
      name: data.name,
      discriminator: data.discriminator,
      country: data.country ?? '',
    });

    wait(1000);

    if (savedData) {
      savePlayerLocalData({
        name: savedData.name,
        discriminator: savedData.discriminator,
        country: savedData.country ?? '',
      });

      wait(1000);

      const player = getPlayerLocalData();
      setPlayerData(player);

      advanceNameChangeFormStep(2);
    }
  };

  if (isLoading) {
    return (
      <PanelFrame className="flex flex-row items-center justify-center">
        <LoadingSpinner />
      </PanelFrame>
    );
  }

  return (
    <div>
      <h2 className="text-2xl text-white font-bold my-3">Enter your name</h2>
      <PanelFrame>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('discriminator')} />
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username <abbr title="required">*</abbr>
          </label>
          <input
            className={cn(
              'shadow appearance-none border rounded w-full py-2 px-3 mb-4  text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
              errors.name ? 'text-red-600 bg-red-100 outline-red-500' : ''
            )}
            id="username"
            {...register('name', {
              required: 'A name is required',
              maxLength: {
                value: 20,
                message: 'Name cannot be more than 20 characters.',
              },
              minLength: {
                value: 3,
                message: 'Name cannot be less than 3 characters.',
              },
              pattern: {
                value: /^[A-Za-z]+$/i,
                message: 'Alpha characters only',
              },
            })}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mb-4 ">{errors.name?.message}</p>
          )}
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="country"
          >
            Country
          </label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <ReactFlagsSelect
                selected={field.value}
                id="country"
                onSelect={(code) => field.onChange(code)}
                placeholder="Select Country"
                className="bg-white mb-4"
                searchable
                {...field}
              />
            )}
          />
          <div className="flex flex-row justify-center items-center gap-4">
            <Button type="submit" leftIcon={<FaEdit />} loading={isLoading}>
              Assign Name
            </Button>
          </div>
        </form>
      </PanelFrame>
    </div>
  );
};
