import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../dbconfig';
import { generateUserHash } from '../utils';
import { DynamoItem } from './dynamoItem';

export class UserModel extends DynamoItem {
  Name: string;
  Discriminator: number;
  Country: string;

  constructor(
    name: string,
    discriminator: number,
    country: string | undefined
  ) {
    super();
    this.Name = name;
    this.Discriminator = discriminator;
    this.Country = country || '';
  }

  get pk(): string {
    return `USER#${generateUserHash(this.Name, this.Discriminator)}`;
  }
  get sk(): string {
    return `USER#${generateUserHash(this.Name, this.Discriminator)}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromItem(item?: Record<string, any>): UserModel {
    if (!item) throw new Error('No Item!');
    return new UserModel(item.Name, item.username, item.country);
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      Name: this.Name,
      Discriminator: this.Discriminator,
      Country: this.Country,
    };
  }
}

export const upsertUser = async (user: UserModel): Promise<UserModel> => {
  try {
    const command = new PutCommand({
      TableName: process.env.DYNAMO_DATA_TABLE_NAME,
      Item: user.toItem(),
      //ConditionExpression: 'attribute_not_exists(pk)',
    });
    const response = await docClient.send(command);
    console.log(response);
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
