import connectMongo from '../mongoDbConfig';
import Score, { IScore } from './score.schema';

export const saveScore = async (score: IScore): Promise<IScore | null> => {
  let ttlDays: number = 120;

  switch (score.gameType) {
    case 'daily':
      ttlDays = 5;
      break;
    case 'adventure':
      ttlDays = 90;
      break;
  }

  try {
    await connectMongo();

    const existingScore = await Score.findOne(
      {
        gameType: score.gameType,
        seed: score.seed,
        name: score.name,
        discriminator: score.discriminator,
      },
      {},
      { sort: { score: -1 } }
    );

    //console.log('Existing score', existingScore);

    if (existingScore) {
      console.log('Updating score', score.score, '>', existingScore.score);
      // Update the score if it's higher
      const updatedScore = await Score.findByIdAndUpdate<IScore>(
        {
          _id: existingScore._id,
        },
        {
          $max: { score: score.score },
        },
        {
          new: true,
        }
      );
      return updatedScore;
    } else {
      // Create a new score if it doesn't exist
      console.log('Creating new score', score);
      const newScore = await Score.create({
        ...score,
        expiresAfter: new Date().setDate(new Date().getDate() + ttlDays),
      });
      return newScore;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
