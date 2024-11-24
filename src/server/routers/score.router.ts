import { publicProcedure, router } from '@/trpc/trpc';
import { z } from 'zod';
import { getScores, saveScore } from '../models/score';
import { IScore } from '../models/score.schema';

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

export const scoreRouter = router({
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
        await saveScore({
          gameType: input.gameType,
          seed: input.seed,
          score: input.score,
          level: input.level,
          name: input.name,
          discriminator: input.discriminator,
          country: input.country,
          provisions: input.provisions ?? [],
        } as IScore);
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
  getScores: publicProcedure
    .input(
      z.object({
        gameType: z.string(),
        seed: z.number().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      console.log(input);
      const resultScores = await getScores(input);
      console.log(resultScores);
      return resultScores;
    }),
});
