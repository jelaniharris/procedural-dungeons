import { z } from 'zod';
import { getScores } from './models/dynamo/score';
import { saveScore } from './models/score';
import { upsertUser } from './models/user';
import { publicProcedure, router } from './trpc';

interface AddUserInputType {
  name: string;
  discriminator: number;
  country: string;
}

interface SaveScoreInputType {
  gameType: string;
  seed: number;
  score: number;
  level: number;
  provisions?: string[];
  name: string;
  discriminator: number;
  country?: string;
}

export const appRouter = router({
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
        const user = await upsertUser(input);
        console.log(user);
        return user;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
  saveScore: publicProcedure
    .input(
      z.object({
        gameType: z.string(),
        seed: z.number(),
        score: z.number(),
        level: z.number(),
        provisions: z.array(z.string()).optional(),
        name: z.string(),
        discriminator: z.number(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: SaveScoreInputType }) => {
      try {
        console.log(input);

        const score = await saveScore({
          gameType: input.gameType,
          seed: input.seed,
          score: input.score,
          level: input.level,
          name: input.name,
          discriminator: input.discriminator,
          country: input.country,
          provisions: input.provisions ?? [],
        });
        console.log(score);
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
  /*getUser: publicProcedure.query(async () => {
    const command = new GetCommand({
      TableName: process.env.DYNAMO_DATA_TABLE_NAME,
      Key: {
        userId: userId,
      },
    });
    try {
      const response = await docClient.send(command);
      console.log(response);
      const item = response.Item;
      if (item === undefined) {
        return {};
      } else {
      }
    } catch (error) {
      throw error;
    }
    return {};
  }),*/
  getScores: publicProcedure
    .input(
      z.object({
        gameType: z.string(),
        seed: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const resultScores = await getScores(input.gameType, input.seed);
      return resultScores;
    }),
});

export type AppRouter = typeof appRouter;
