import { z } from 'zod';
import { ScoreModel, saveScore } from './models/score';
import { UserModel, createUser } from './models/user';
import { publicProcedure, router } from './trpc';

interface AddUserInputType {
  name: string;
  discriminator: number;
}

interface SaveScoreInputType {
  name: string;
  discriminator: number;
  gameType: string;
  seed: number;
  score: number;
}

export const appRouter = router({
  addUser: publicProcedure
    .input(
      z.object({
        name: z.string(),
        discriminator: z.number(),
      })
    )
    .mutation(async ({ input }: { input: AddUserInputType }) => {
      try {
        const user = await createUser(
          new UserModel(input.name, input.discriminator)
        );
        console.log(user);
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
        gameType: z.string(),
        seed: z.number(),
        score: z.number(),
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
            input.score
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
  getScores: publicProcedure.query(async () => {
    /*const command = new QueryCommand({
      TableName: process.env.DYNAMO_DATA_TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk',
      ExpressionAttributeValues: {
        ':gsi1pk': '',
      },
      Limit: 150,
      //ScanIndexForward: false

      Key: {
        userId: userId,
      },
    });*/

    return [10, 20, 30];
  }),
});

export type AppRouter = typeof appRouter;
