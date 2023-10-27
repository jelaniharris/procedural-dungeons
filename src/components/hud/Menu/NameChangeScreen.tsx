import { trpc } from '@/app/_trpc/client';
import Button from '@/components/input/Button';
import { getPlayerLocalData, savePlayerLocalData } from '@/utils/playerUtils';
import { FormEvent, useState } from 'react';
import useMainMenuContext from '../useMainMenuContext';
import ScreenHeader from './ScreenHeader';

type NameFormData = {
  name: string;
  discriminator: number;
};

const NameChangeScreen = () => {
  const { playerData, setPlayerData, popScreen } = useMainMenuContext();
  const addUser = trpc.addUser.useMutation({
    onSettled: () => {},
  });
  const [data, setData] = useState<NameFormData>({
    name: playerData ? playerData.name : '',
    discriminator: Math.floor(Math.random() * 999),
  });

  const assignName = (e: FormEvent) => {
    e.preventDefault();
    console.log('saving data: ', data);
    savePlayerLocalData({
      name: data.name,
      discriminator: data.discriminator,
    });
    const player = getPlayerLocalData();
    setPlayerData(player);
    addUser.mutate({ name: data.name, discriminator: data.discriminator });
  };

  const changeData = (dataName: string, value: string) => {
    setData({
      ...data,
      [dataName]: value,
    });
  };

  return (
    <>
      <ScreenHeader />
      <div className="flex-auto"></div>
      <div className="">
        <h2 className="text-2xl text-white font-bold my-3">Enter your name</h2>
        <form
          className="bg-slate-600 shadow-md rounded px-8 py-8 mb-4"
          onSubmit={assignName}
        >
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            onChange={(event) => changeData('name', event.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 mb-4  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            value={data.name}
          />
          <div className="flex flex-row items-center gap-3 ">
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
