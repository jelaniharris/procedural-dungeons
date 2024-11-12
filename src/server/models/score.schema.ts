import { model, models, Schema } from 'mongoose';

export interface IScore {
  gameType: string;
  seed: number;
  score: number;
  level: number;
  updatedAt?: Date;
  createdAt?: Date;
  provisions: string[];
  expiresAfter?: Date;
  name: string;
  discriminator: number;
  country?: string;
}

const ScoreSchema = new Schema<IScore>(
  {
    gameType: { type: String, required: true },
    seed: { type: Number, required: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true },
    updatedAt: { type: Date, required: false },
    createdAt: { type: Date, required: false },
    provisions: { type: [String], required: false },
    expiresAfter: { type: Date, required: false },
    name: { type: String, required: true },
    discriminator: { type: Number, required: true },
    country: { type: String, required: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        delete ret._id;
      },
    },
  }
);

const Score = models.Score || model<IScore>('Score', ScoreSchema);
export default Score;
