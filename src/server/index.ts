import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { docClient } from './dbconfig';
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

const generateUserHash = (name: string, discriminator: number) => {
  const userHash = `${name}:${discriminator.toString().padStart(4, '0')}`;
  return userHash;
};
const generateGameHash = (gameType: string, seed: number) => {
  const gameHash = `${gameType}:${seed}`;
  return gameHash;
};

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
        //ConditionExpression:"attribute_not_exists(pk)"
      });
      try {
        const response = await docClient.send(command);
        console.log(response);
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
      const userHash = generateUserHash(input.name, input.discriminator);
      const gameHash = generateGameHash(input.gameType, input.seed);

      const command = new UpdateCommand({
        TableName: process.env.DYNAMO_DATA_TABLE_NAME,
        Key: {
          pk: `GAME#${gameHash}`,
          sk: `USER#${userHash}`,
        },
        UpdateExpression:
          'SET #et = :entity_type, #s = :score, GSI1PK = :gamehash, GSI1SK = :score_string, #uat = :updated_at ADD #att :amount',
        ExpressionAttributeNames: {
          '#s': 'Score',
          '#et': 'EntityType',
          '#uat': 'UpdatedAt',
          '#att': 'Attempts',
        },
        ExpressionAttributeValues: {
          ':entity_type': 'GameScore',
          ':gamehash': `GAME#${gameHash}`,
          ':score': input.score,
          ':score_string': `${input.score}`,
          ':updated_at': new Date().toISOString(),
          ':amount': 1,
        },
        ConditionExpression: 'attribute_not_exists(Score) OR :score > Score',
        ReturnValues: 'ALL_NEW',
      });
      try {
        const response = await docClient.send(command);
        console.log(response);
      } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
          console.log(
            `Score was not good enough to save: ${gameHash} - ${userHash} : ${input.score}`
          );
        } else {
          console.log(error);
          throw error;
        }
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
