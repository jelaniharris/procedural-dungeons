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
        // If not in adventure type, then find for matching seed
        ...(score.gameType != 'adventure' && { seed: score.seed }),
        name: score.name,
        discriminator: score.discriminator,
      },
      {},
      { sort: { score: -1 } }
    );

    if (existingScore) {
      // Update the score if it's higher
      if (score.score >= existingScore.score) {
        const updatedScore = await Score.findByIdAndUpdate<IScore>(
          {
            _id: existingScore._id,
          },
          {
            $set: {
              score: score.score,
              level: score.level,
              country: score.country,
            },
            $inc: { attempts: 1 },
          },
          {
            new: true,
          }
        );
        return updatedScore;
      } else {
        const updatedScore = await Score.findByIdAndUpdate<IScore>(
          {
            _id: existingScore._id,
          },
          {
            $inc: { attempts: 1 },
          },
          {
            new: true,
          }
        );
        return updatedScore;
      }
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

export interface GetScoresDto {
  gameType: string;
  seed?: number;
  limit?: number;
}

export const getScores = async (params: GetScoresDto): Promise<IScore[]> => {
  const { gameType, seed, limit } = params;
  try {
    await connectMongo();
    const scores = await Score.find<IScore>(
      { gameType: gameType, ...(seed && { seed: seed }) },
      {},
      { limit: limit || 50 }
    ).sort({ score: -1 });

    return scores;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
