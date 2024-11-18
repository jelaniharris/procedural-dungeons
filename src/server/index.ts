import { mergeRouters } from '../trpc/trpc';
import { scoreRouter } from './routers/score.router';
import { userRouter } from './routers/user.router';

export const appRouter = mergeRouters(scoreRouter, userRouter);

export type AppRouter = typeof appRouter;
