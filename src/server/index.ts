import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { docClient } from './dbconfig';
import { publicProcedure, router } from './trpc';

interface AddUserInputType {
  name: string;
  discriminator: number;
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
      const userHash = `${input.name}:${input.discriminator
        .toString()
        .padStart(4, '0')}`;

      console.log('Using hash of ', userHash);

      const command = new PutCommand({
        TableName: process.env.DYNAMO_DATA_TABLE_NAME,
        Item: {
          pk: `USER#${userHash}`,
          sk: `USER#${userHash}`,
        },
      });
      try {
        const response = await docClient.send(command);
        console.log(response);
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
    return [10, 20, 30];
  }),
});

export type AppRouter = typeof appRouter;
