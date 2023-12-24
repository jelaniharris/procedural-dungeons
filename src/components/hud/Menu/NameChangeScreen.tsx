import { trpc } from '@/app/_trpc/client';
import Button from '@/components/input/Button';
import { cn } from '@/utils/classnames';
import { getPlayerLocalData, savePlayerLocalData } from '@/utils/playerUtils';
import ReactFlagsSelect from 'react-flags-select';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import useMainMenuContext from '../useMainMenuContext';
import ScreenHeader from './ScreenHeader';

interface IFormInputs {
  name: string;
  country: string;
  discriminator: number;
}

const NameChangeScreen = () => {
  const { playerData, setPlayerData, popScreen } = useMainMenuContext();

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

  const addUser = trpc.addOrUpdateUser.useMutation({
    onSettled: (data) => {
      console.log('Save data results: ', data);
      if (!data) {
        return;
      }

      savePlayerLocalData({
        name: data.Name,
        discriminator: data.Discriminator,
        country: data.Country ?? '',
      });

      const player = getPlayerLocalData();
      setPlayerData(player);
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    addUser.mutate({
      name: data.name,
      discriminator: data.discriminator,
      country: data.country ?? '',
    });
  };

  return (
    <>
      <ScreenHeader hideName />
      <div className="flex-auto"></div>
      <div className="">
        <h2 className="text-2xl text-white font-bold my-3">Enter your name</h2>
        <form
          className="bg-slate-600 shadow-md rounded px-8 py-8 mb-4"
          onSubmit={handleSubmit(onSubmit)}
        >
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
          <div className="flex flex-row items-center gap-4">
            <Button type="submit">Assign Name</Button>
          </div>
        </form>
      </div>{' '}
      <div className="flex-auto"></div>
      <Button variant="danger" type="submit" onClick={() => popScreen()}>
        Back
      </Button>
    </>
  );
};

export default NameChangeScreen;
