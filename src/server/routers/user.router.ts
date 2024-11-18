import { router } from '@/trpc/trpc';
import { z } from 'zod';
import { publicProcedure } from '../../trpc/trpc';
import { upsertUser } from '../models/user';
import { IUser } from '../models/user.schema';

interface AddUserInputType {
  name: string;
  discriminator: number;
  country: string;
}

export const userRouter = router({
  addOrUpdateUser: publicProcedure
    .input(
      z.object({
        name: z.string(),
        discriminator: z.number(),
        country: z.string(),
      })
    )
    .mutation(async ({ input }: { input: AddUserInputType }) => {
      try {
        const user = await upsertUser(input as IUser);
        return user;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
});
