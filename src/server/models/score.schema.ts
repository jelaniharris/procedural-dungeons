import { model, models, Schema } from 'mongoose';

export interface IScore {
  name: string;
  discriminator: number;
  gameType: string;
  seed: number;
  score: number;
  level: number;
  country: string;
  updatedAt?: Date;
  createdAt?: Date;
  provisions: string[];
}

const ScoreSchema = new Schema<IScore>(
  {
    name: { type: String, required: true },
    discriminator: { type: Number, required: true },
    gameType: { type: String, required: true },
    seed: { type: Number, required: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true },
    country: { type: String, required: true },
    updatedAt: { type: Date, required: false },
    createdAt: { type: Date, required: false },
    provisions: { type: [String], required: false },
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
