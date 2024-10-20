import { model, models, Schema } from 'mongoose';

export interface IUser {
  name: string;
  discriminator: number;
  country?: string;
}

const UserSchema = new Schema<IUser>(
  {
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

const User = models.User || model<IUser>('User', UserSchema);

export default User;
