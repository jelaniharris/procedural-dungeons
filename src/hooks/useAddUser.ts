import { trpc } from '@/app/_trpc/client';

export const useAddUser = () => {
  const {
    mutateAsync: addUser,
    isLoading,
    isSuccess,
    isError,
    error,
  } = trpc.addOrUpdateUser.useMutation({
    onMutate: () => {
      console.log('New user is being saved');
    },
    onSuccess: async (data) => {
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    isLoading,
    addUser,
    isSuccess,
    isError,
    error,
  };
};
