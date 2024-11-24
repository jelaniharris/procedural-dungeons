import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
const cached: {
  connection?: typeof mongoose | null;
  promise?: Promise<typeof mongoose>;
} = { connection: null };

async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define MONGODB_URI environment variable inside .env.local'
    );
  }

  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
    try {
      cached.connection = await cached.promise;
    } catch (e) {
      cached.promise = undefined;
      throw e;
    }
    return cached.connection;
  }
}

export default connectMongo;
