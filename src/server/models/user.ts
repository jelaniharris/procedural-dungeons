import connectMongo from '../mongoDbConfig';
import User, { IUser } from './user.schema';

export const upsertUser = async (user: IUser): Promise<IUser> => {
  // Logic to upsert user
  await connectMongo();

  try {
    const newUser = await User.findOneAndUpdate({ name: user.name }, user, {
      new: true,
      upsert: true,
    });
    console.log('Created new user: ', newUser);
    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
