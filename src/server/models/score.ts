import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../dbconfig';
import { generateGameHash, generateUserHash } from '../utils';
import { DynamoItem } from './dynamoItem';

export class ScoreModel extends DynamoItem {
  name: string;
  Discriminator: number;
  GameType: string;
  seed: number;
  score: number;
  UpdatedAt?: string;

  constructor(
    name: string,
    Discriminator: number,
    GameType: string,
    seed: number,
    score: number,
    UpdatedAt?: string
  ) {
    super();
    this.name = name;
    this.Discriminator = Discriminator;
    this.GameType = GameType;
    this.seed = seed;
    this.score = score;
    this.UpdatedAt = UpdatedAt;
  }

  get pk(): string {
    return `GAME#${generateGameHash(this.GameType, this.seed)}`;
  }
  get sk(): string {
    return `USER#${generateUserHash(this.name, this.Discriminator)}`;
  }

  get gsi1pk(): string {
    return this.pk;
  }

  get gsi1sk(): string {
    return `${this.score}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromItem(item?: Record<string, any>): ScoreModel {
    if (!item) throw new Error('No Item!');
    return new ScoreModel(
      item.name,
      item.Discriminator,
      item.GameType,
      item.seed,
      item.score,
      item.UpdatedAt
    );
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      GSI1PK: this.gsi1pk,
      GSI1SK: this.gsi1sk,
      name: this.name,
      Discriminator: this.Discriminator,
      GameType: this.GameType,
      seed: this.seed,
      score: this.score,
    };
  }
}

export const saveScore = async (
  score: ScoreModel
): Promise<ScoreModel | null> => {
  const gameHash = generateGameHash(score.GameType, score.seed);
  const userHash = generateUserHash(score.name, score.Discriminator);

  try {
    const command = new UpdateCommand({
      TableName: process.env.DYNAMO_DATA_TABLE_NAME,
      Key: score.keys(),
      ConditionExpression: 'attribute_not_exists(Score) OR :score > Score',
      UpdateExpression:
        'SET #et = :entity_type, #s = :score, GSI1PK = :gamehash, GameType = :GameType, Seed = :seed, GSI1SK = :score_string, #uat = :updated_at, #name = :name, Discriminator = :Discriminator ADD #att :amount',
      ExpressionAttributeNames: {
        '#s': 'Score',
        '#et': 'EntityType',
        '#uat': 'UpdatedAt',
        '#att': 'Attempts',
        '#name': 'Name',
      },
      ExpressionAttributeValues: {
        ':entity_type': 'GameScore',
        ':name': score.name,
        ':Discriminator': score.Discriminator,
        ':gamehash': score.gsi1pk,
        ':GameType': score.GameType,
        ':seed': score.seed,
        ':score': score.score,
        ':score_string': score.gsi1sk,
        ':updated_at': new Date().toISOString(),
        ':amount': 1,
      },
      ReturnValues: 'ALL_NEW',
    });
    const response = await docClient.send(command);
    console.log(response);
    return ScoreModel.fromItem(response.Attributes);
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      console.log(
        `Score was not good enough to save: ${gameHash} - ${userHash} : ${score.score}`
      );
      return null;
    } else {
      console.log(error);
      throw error;
    }
  }
};
