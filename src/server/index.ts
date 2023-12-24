import { z } from 'zod';
import { ScoreModel, getScores, saveScore } from './models/score';
import { UserModel, upsertUser } from './models/user';
import { publicProcedure, router } from './trpc';

interface AddUserInputType {
  name: string;
  discriminator: number;
  country: string;
}

interface SaveScoreInputType {
  name: string;
  discriminator: number;
  gameType: string;
  seed: number;
  score: number;
  level: number;
  country: string;
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
        const user = await upsertUser(
          new UserModel(input.name, input.discriminator, input.country)
        );
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
        name: z.string(),
        discriminator: z.number(),
        country: z.string(),
        gameType: z.string(),
        seed: z.number(),
        score: z.number(),
        level: z.number(),
      })
    )
    .mutation(async ({ input }: { input: SaveScoreInputType }) => {
      try {
        const score = await saveScore(
          new ScoreModel(
            input.name,
            input.discriminator,
            input.gameType,
            input.seed,
            input.score,
            input.level,
            input.country
          )
        );
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
